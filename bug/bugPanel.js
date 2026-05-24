import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export function getBugReportPanel() {
  const embed = new EmbedBuilder()
    .setColor("#ff4444")
    .setTitle("🐞 Found a Bug?")
    .setDescription(
      "If you discovered a bug while playing the game, you can report it here.\n\n" +
      "Click the button below and the bot will DM you a short form to fill out.\n" +
      "Please make sure your DMs are open!"
    )
    .setFooter({ text: "My Fighting Brainrots — Bug Reporting System" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bug_start")
      .setLabel("Report Bug")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}