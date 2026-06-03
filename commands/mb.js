// commands/mb.js
import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("mb")
    .setDescription("Fetch Roblox display name from a Roblox ID")
    .addStringOption(opt =>
      opt
        .setName("roblox_id")
        .setDescription("The Roblox user ID")
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt
        .setName("ping")
        .setDescription("User to ping")
        .setRequired(false)
    ),

  async execute(interaction) {
    const robloxId = interaction.options.getString("roblox_id");
    const pingUser = interaction.options.getUser("ping");

    try {
      const res = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);
      const data = await res.json();

      if (data.errors) {
        return interaction.reply({
          content: "❌ Invalid Roblox ID or user not found.",
          ephemeral: true
        });
      }

      const displayName = data.displayName;
      const username = data.name;

      const pingText = pingUser ? `<@${pingUser.id}>` : "";

      await interaction.reply(
        `${pingText}\n🟦 **Roblox User Info**\n` +
        `**Display Name:** ${displayName}\n` +
        `**Username:** ${username}\n` +
        `**User ID:** ${robloxId}`
      );

    } catch (err) {
      console.error("MB slash command error:", err);
      await interaction.reply({
        content: "❌ Failed to fetch Roblox user info.",
        ephemeral: true
      });
    }
  }
};
