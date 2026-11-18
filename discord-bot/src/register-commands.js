import "dotenv/config";
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Scan existing channels and connect supported PRI-ANIME features (no channel changes)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the PRI-ANIME XP leaderboard"),
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create a private support ticket"),
  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Remove recent messages from this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => option.setName("amount").setDescription("Number of messages (1–50)").setMinValue(1).setMaxValue(50).setRequired(true)),
  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Temporarily timeout a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => option.setName("member").setDescription("Member to timeout").setRequired(true))
    .addIntegerOption(option => option.setName("minutes").setDescription("Duration in minutes (1–40320)").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption(option => option.setName("reason").setDescription("Reason for the action").setMaxLength(300).setRequired(true)),
  new SlashCommandBuilder()
    .setName("close-ticket")
    .setDescription("Close the current support ticket")
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
