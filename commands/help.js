import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show available commands."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("MFB System — Help")
      .setDescription("Available commands:")
      .addFields(
        { name: "/settings", value: "Open settings panel.", inline: false },
        { name: "/vouch", value: "Record a vouch for a user.", inline: false },
        { name: "/cooldown", value: "View or set cooldowns.", inline: false },
        { name: "/threshold", value: "View or set dupe threshold.", inline: false },
        { name: "/severity", value: "Test severity levels.", inline: false },
        { name: "/ping", value: "Check bot latency.", inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
