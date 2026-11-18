import "dotenv/config";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  Client, GatewayIntentBits, Partials, Events, ChannelType,
  PermissionFlagsBits, EmbedBuilder
} from "discord.js";
import Database from "better-sqlite3";
import { COMMUNITY_LAYOUT, CHANNEL } from "./config.js";

const required = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const databasePath = process.env.DATABASE_PATH || "./data/pri-anime.sqlite";
mkdirSync(dirname(databasePath), { recursive: true });
const db = new Database(databasePath);
const xpCooldown = new Map();
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS xp (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS tickets (
    channel_id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS mission_progress (
    guild_id TEXT NOT NULL, user_id TEXT NOT NULL, period_type TEXT NOT NULL,
    period_key TEXT NOT NULL, mission_id TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id, period_type, period_key, mission_id)
  );
  CREATE TABLE IF NOT EXISTS mission_claims (
    guild_id TEXT NOT NULL, user_id TEXT NOT NULL, period_type TEXT NOT NULL,
    period_key TEXT NOT NULL, mission_id TEXT NOT NULL, claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, user_id, period_type, period_key, mission_id)
  );
`);

const DAILY_MISSION = { id: "daily-chat", title: "Daily chatter", target: 10, reward: 25, period: "daily" };
const WEEKLY_MISSION = { id: "weekly-chat", title: "Weekly community member", target: 50, reward: 100, period: "weekly" };
function missionPeriodKey(period, date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (period === "daily") return d.toISOString().slice(0, 10);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}
function getMissionProgress(guildId, userId, mission) {
  const key = missionPeriodKey(mission.period);
  const row = db.prepare("SELECT progress FROM mission_progress WHERE guild_id=? AND user_id=? AND period_type=? AND period_key=? AND mission_id=?")
    .get(guildId, userId, mission.period, key, mission.id);
  const claimed = db.prepare("SELECT 1 FROM mission_claims WHERE guild_id=? AND user_id=? AND period_type=? AND period_key=? AND mission_id=?")
    .get(guildId, userId, mission.period, key, mission.id);
  return { key, progress: row?.progress ?? 0, claimed: Boolean(claimed) };
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const CHANNEL_ALIASES = {
  welcome: ["welcome", "welcome-room", "new-members", "introductions"],
  levelUps: ["level-ups", "level-up", "levelup", "level-up-notifications"],
  leaderboard: ["leaderboard", "rankings", "top-members", "top-xp"],
  modLogs: ["mod-logs", "mod-log", "moderation-logs", "automod-logs", "staff-logs"],
  botLogs: ["bot-logs", "bot-log", "bot-status", "bot-activity"],
  tickets: ["tickets", "ticket-support", "support-tickets", "help-desk"],
  ai: ["ai-chat", "ask-ai", "anime-ai", "bot-chat", "assistant"]
};

const normalizeChannelName = value => String(value || "")
  .normalize("NFKD")
  .replace(/\p{M}/gu, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const getTextChannel = (guild, purpose) => {
  const aliases = CHANNEL_ALIASES[purpose] || [purpose];
  const candidates = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
  return candidates.find(channel => {
    const name = normalizeChannelName(channel.name);
    return aliases.some(alias => {
      const normalizedAlias = normalizeChannelName(alias);
      return name === normalizedAlias || name.startsWith(normalizedAlias + "-") || name.endsWith("-" + normalizedAlias);
    });
  });
};

async function scanExistingChannels(guild) {
  await guild.channels.fetch();
  const routes = {};
  for (const purpose of Object.keys(CHANNEL_ALIASES)) {
    const channel = getTextChannel(guild, purpose);
    if (channel) routes[purpose] = channel;
  }
  return routes;
}

async function ensureCommunityLayout(guild) {
  const everyone = guild.roles.everyone;
  for (const group of COMMUNITY_LAYOUT) {
    let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === group.category);
    if (!category) category = await guild.channels.create({ name: group.category, type: ChannelType.GuildCategory });
    for (const [name, topic] of group.channels) {
      const existing = getTextChannel(guild, name);
      if (existing) continue;
      const staffOnly = group.category === "STAFF ONLY";
      const overwrites = staffOnly
        ? [{ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }]
        : [];
      await guild.channels.create({
        name, type: ChannelType.GuildText, parent: category.id, topic, permissionOverwrites: overwrites
      });
    }
  }
}

async function syncLevelRewardRoles(guild, userId, points) {
  const level = Math.floor(points / 100);
  const member = await guild.members.fetch(userId);
  const awarded = [];
  // Configure LEVEL_ROLE_5_ID, LEVEL_ROLE_10_ID, etc. in Railway.
  // Roles are cumulative and this function never removes existing roles.
  for (let milestone = 5; milestone <= level; milestone += 5) {
    const roleId = process.env[`LEVEL_ROLE_${milestone}_ID`];
    if (!roleId || member.roles.cache.has(roleId)) continue;
    const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
    if (!role || !role.editable) {
      console.warn(`Level ${milestone} reward role is missing or below the bot's role hierarchy.`);
      continue;
    }
    await member.roles.add(role, `PRI-ANIME Level ${milestone} reward`);
    awarded.push(role.name);
  }
  return awarded;
}

client.once(Events.ClientReady, ready => {
  console.log(`PRI-ANIME CORE online as ${ready.user.tag}`);
});

client.on(Events.GuildMemberAdd, async member => {
  const channel = getTextChannel(member.guild, CHANNEL.welcome);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setColor(0x8b1e3f)
    .setTitle("Welcome to PRI-ANIME!")
    .setDescription(`Welcome ${member} — please read #rules and introduce yourself.`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();
  await channel.send({ embeds: [embed] });
});

client.on(Events.MessageCreate, async message => {
  if (!message.guild || message.author.bot) return;
  if (message.channel.name === CHANNEL.ai) {
    // AI replies are intentionally opt-in; connect a server-side provider before enabling.
    if (!process.env.OPENAI_API_KEY) return;
  }
  if (message.content.trim().length >= 8) {
    const bumpMission = db.prepare("INSERT INTO mission_progress (guild_id,user_id,period_type,period_key,mission_id,progress) VALUES (?,?,?,?,?,1) ON CONFLICT(guild_id,user_id,period_type,period_key,mission_id) DO UPDATE SET progress=progress+1");
    bumpMission.run(message.guild.id, message.author.id, "daily", missionPeriodKey("daily"), DAILY_MISSION.id);
    bumpMission.run(message.guild.id, message.author.id, "weekly", missionPeriodKey("weekly"), WEEKLY_MISSION.id);
  }
  const cooldownKey = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  if (now - (xpCooldown.get(cooldownKey) || 0) < 60_000) return;
  xpCooldown.set(cooldownKey, now);
  const points = db.prepare("INSERT INTO xp (guild_id,user_id,points) VALUES (?,?,1) ON CONFLICT(guild_id,user_id) DO UPDATE SET points=points+1 RETURNING points")
    .get(message.guild.id, message.author.id)?.points ?? 0;
  const oldLevel = Math.floor((points - 1) / 100);
  const newLevel = Math.floor(points / 100);
  if (points > 0 && newLevel > oldLevel) {
    const channel = getTextChannel(message.guild, CHANNEL.levelUps);
    if (channel) await channel.send(`🎉 ${message.author} reached **Level ${newLevel}**! Keep being part of PRI-ANIME.`);
  }
  await syncLevelRewardRoles(message.guild, message.author.id, points).catch(error =>
    console.warn("Could not sync level reward roles:", error.message)
  );
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "setup") {
    // Acknowledge before permission checks or network work to avoid Discord's 3-second timeout.
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.editReply("Only server administrators can run setup.");
    }
    try {
      const routes = await scanExistingChannels(interaction.guild);
      const allTextChannels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      const found = Object.entries(routes).map(([purpose, channel]) => `• **${purpose}** → <#${channel.id}>`);
      const missing = Object.keys(CHANNEL_ALIASES).filter(purpose => !routes[purpose]);
      const summary = [
        "✅ **PRI-ANIME CORE channel scan complete**",
        `Scanned **${allTextChannels.size}** existing text channels.`,
        "",
        found.length ? "**Connected channel routes**\n" + found.join("\n") : "No known feature channels matched yet.",
        "",
        missing.length ? "**Not found (no channel was created):** " + missing.join(", ") : "All supported channel routes were found.",
        "",
        "🔒 No channels, categories, names, or permissions were changed."
      ].join("\n");
      const log = routes.botLogs;
      if (log) await log.send(summary).catch(error => console.warn("Could not post setup summary to bot logs:", error.message));
      return interaction.editReply(summary);
    } catch (error) {
      console.error("Channel scan failed:", error);
      return interaction.editReply("❌ Channel scan failed. No channels were created, deleted, renamed, or changed. Check Railway logs for details.");
    }
  }

  if (interaction.commandName === "missions") {
    const lines = [DAILY_MISSION, WEEKLY_MISSION].map(mission => {
      const state = getMissionProgress(interaction.guildId, interaction.user.id, mission);
      const status = state.claimed ? "✅ Reward claimed" : state.progress >= mission.target ? "🎁 Ready to claim" : "In progress";
      return `**${mission.title}** — ${mission.period}\n${Math.min(state.progress, mission.target)}/${mission.target} messages • ${mission.reward} XP\n${status}`;
    });
    return interaction.reply({ content: "🎯 **PRI-ANIME Missions**\n\n" + lines.join("\n\n"), ephemeral: true });
  }

  if (interaction.commandName === "claim-mission") {
    const period = interaction.options.getString("period", true);
    const mission = period === "daily" ? DAILY_MISSION : WEEKLY_MISSION;
    const state = getMissionProgress(interaction.guildId, interaction.user.id, mission);
    if (state.claimed) return interaction.reply({ content: "You already claimed this mission's reward for the current period.", ephemeral: true });
    if (state.progress < mission.target) return interaction.reply({ content: `Mission not complete yet: ${state.progress}/${mission.target} messages.`, ephemeral: true });
    const claim = db.transaction(() => {
      const inserted = db.prepare("INSERT OR IGNORE INTO mission_claims (guild_id,user_id,period_type,period_key,mission_id) VALUES (?,?,?,?,?)")
        .run(interaction.guildId, interaction.user.id, mission.period, state.key, mission.id);
      if (!inserted.changes) return false;
      db.prepare("INSERT INTO xp (guild_id,user_id,points) VALUES (?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET points=points+excluded.points")
        .run(interaction.guildId, interaction.user.id, mission.reward);
      return true;
    })();
    if (!claim) return interaction.reply({ content: "This reward was already claimed.", ephemeral: true });
    const totalPoints = db.prepare("SELECT points FROM xp WHERE guild_id=? AND user_id=?").get(interaction.guildId, interaction.user.id)?.points ?? 0;
    await syncLevelRewardRoles(interaction.guild, interaction.user.id, totalPoints).catch(error =>
      console.warn("Could not sync mission level reward roles:", error.message)
    );
    return interaction.reply({ content: `🎉 Mission complete! **+${mission.reward} XP** added to your PRI-ANIME profile.`, ephemeral: true });
  }

  if (interaction.commandName === "leaderboard") {
    const rows = db.prepare("SELECT user_id, points FROM xp WHERE guild_id=? ORDER BY points DESC LIMIT 10").all(interaction.guildId);
    const description = rows.length
      ? rows.map((row, i) => `**${i + 1}.** <@${row.user_id}> — ${row.points} XP (Level ${Math.floor(row.points / 100)})`).join("\n")
      : "No XP recorded yet. Start chatting to appear here!";
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x8b1e3f).setTitle("PRI-ANIME Leaderboard").setDescription(description)] });
  }

  if (interaction.commandName === "ticket") {
    await interaction.deferReply({ ephemeral: true });
    const existing = db.prepare("SELECT channel_id FROM tickets WHERE guild_id=? AND user_id=?").get(interaction.guildId, interaction.user.id);
    if (existing && interaction.guild.channels.cache.has(existing.channel_id)) {
      return interaction.editReply(`You already have an open ticket: <#${existing.channel_id}>`);
    }
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 16)}`,
      type: ChannelType.GuildText,
      parent: getTextChannel(interaction.guild, CHANNEL.tickets)?.parentId ?? undefined,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
      ]
    });
    db.prepare("INSERT OR REPLACE INTO tickets(channel_id,guild_id,user_id) VALUES (?,?,?)").run(channel.id, interaction.guildId, interaction.user.id);
    await channel.send(`Hello ${interaction.user}, staff will assist you here. Please describe your issue.`);
    return interaction.editReply(`Your private ticket is ready: ${channel}`);
  }

  if (interaction.commandName === "purge") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: "You need Manage Messages permission.", ephemeral: true });
    }
    const amount = interaction.options.getInteger("amount", true);
    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);
    const log = getTextChannel(interaction.guild, CHANNEL.modLogs);
    if (log) await log.send(`🧹 ${interaction.user} deleted ${deleted.size} recent messages in <#${interaction.channelId}>.`);
    return interaction.editReply(`Deleted ${deleted.size} messages. Discord does not bulk-delete messages older than 14 days.`);
  }

  if (interaction.commandName === "timeout") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "You need Moderate Members permission.", ephemeral: true });
    }
    const target = interaction.options.getMember("member");
    const minutes = interaction.options.getInteger("minutes", true);
    const reason = interaction.options.getString("reason", true);
    if (!target || !target.moderatable) {
      return interaction.reply({ content: "That member cannot be timed out by this bot. Check role hierarchy and permissions.", ephemeral: true });
    }
    await target.timeout(minutes * 60_000, reason);
    const log = getTextChannel(interaction.guild, CHANNEL.modLogs);
    if (log) await log.send(`⏱️ ${target.user.tag} was timed out by ${interaction.user.tag} for ${minutes} minute(s). Reason: ${reason}`);
    return interaction.reply({ content: `Timed out ${target.user.tag} for ${minutes} minute(s).`, ephemeral: true });
  }

  if (interaction.commandName === "close-ticket") {
    const ticket = db.prepare("SELECT user_id FROM tickets WHERE channel_id=?").get(interaction.channelId);
    if (!ticket) return interaction.reply({ content: "This channel is not an active ticket.", ephemeral: true });
    const isOwner = ticket.user_id === interaction.user.id;
    const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
    if (!isOwner && !isStaff) return interaction.reply({ content: "Only the ticket owner or staff can close this ticket.", ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(ticket.user_id, { SendMessages: false });
    db.prepare("DELETE FROM tickets WHERE channel_id=?").run(interaction.channelId);
    return interaction.reply({ content: "Ticket closed and locked. This channel has been kept; staff can still review it.", ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
