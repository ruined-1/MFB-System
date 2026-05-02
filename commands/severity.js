import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getSeverityColor, getSeverityLabel } from "../dupe/severity.js";

export default {
  data: new SlashCommandBuilder()
    .setName("severity")
    .setDescription("Test severity for a given remaining time.")
    .addIntegerOption(opt =>
      opt.setName("seconds")
        .setDescription("Seconds remaining")
        .setRequired(true)
    ),
  async execute(interaction) {
    const seconds = interaction.options.getInteger("seconds");
    const label = getSeverityLabel(seconds);
    const color = getSeverityColor(seconds);

    const embed = new EmbedBuilder()
      .setTitle("Severity Test")
      .addFields(
        { name: "Seconds", value: `${seconds}`, inline: true },
        { name: "Severity", value: label, inline: true }
      )
      .setColor(color)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
