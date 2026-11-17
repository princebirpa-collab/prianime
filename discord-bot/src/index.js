import "dotenv/config";
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

const db = new Database(process.env.DATABASE_PATH || "./data/pri-anime.sqlite");
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
`);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const getTextChannel = (guild, name) =>
  guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.name === name);

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
  const points = db.prepare("INSERT INTO xp (guild_id,user_id,points) VALUES (?,?,1) ON CONFLICT(guild_id,user_id) DO UPDATE SET points=points+1 RETURNING points")
    .get(message.guild.id, message.author.id)?.points ?? 0;
  const oldLevel = Math.floor((points - 1) / 100);
  const newLevel = Math.floor(points / 100);
  if (points > 0 && newLevel > oldLevel) {
    const channel = getTextChannel(message.guild, CHANNEL.levelUps);
    if (channel) await channel.send(`🎉 ${message.author} reached **Level ${newLevel}**! Keep being part of PRI-ANIME.`);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "setup") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "Only server administrators can run setup.", ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    await ensureCommunityLayout(interaction.guild);
    const log = getTextChannel(interaction.guild, CHANNEL.botLogs);
    if (log) await log.send("✅ PRI-ANIME channel setup completed. Existing channels were left unchanged.");
    return interaction.editReply("Setup complete. Missing categories and channels have been created; existing channels were left untouched.");
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
});

client.login(process.env.DISCORD_TOKEN);
