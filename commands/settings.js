import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Open the MFB System settings panel"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("⚙️ MFB System — Settings Panel")
      .setDescription("Choose an option below.")
      .setColor("#5865F2");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("settings_threshold")
        .setLabel("Threshold")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("settings_cooldowns")
        .setLabel("Cooldowns")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("settings_severity")
        .setLabel("Severity Test")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("settings_vouchboard")
        .setLabel("Vouch Leaderboard")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};
