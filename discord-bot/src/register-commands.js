import "dotenv/config";
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Create missing PRI-ANIME categories and channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the PRI-ANIME XP leaderboard"),
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create a private support ticket")
].map(command => command.toJSON());

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_GUILD_ID) {
  throw new Error("Set DISCORD_TOKEN, DISCORD_CLIENT_ID and DISCORD_GUILD_ID in .env");
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
  { body: commands }
);
console.log("PRI-ANIME slash commands registered.");
