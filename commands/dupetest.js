import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getSeverityLabel, getSeverityColor } from "../dupe/severity.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dupetest")
    .setDescription("Test severity and embed output for a given amount.")
    .addIntegerOption(opt =>
      opt.setName("amount")
        .setDescription("Amount owned")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const severity = getSeverityLabel(amount);
    const color = getSeverityColor(amount);

    const embed = new EmbedBuilder()
      .setTitle("🧪 Dupe Severity Test")
      .addFields(
        { name: "Amount Owned", value: `${amount}`, inline: true },
        { name: "Severity", value: severity, inline: true }
      )
      .setColor(color)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
