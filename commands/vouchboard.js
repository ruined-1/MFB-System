import { EmbedBuilder } from "discord.js";
import { vouches } from "../vouches.js";

export default async function leaderboard(interaction) {
  const sorted = Object.entries(vouches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (sorted.length === 0) {
    return interaction.reply({
      content: "No vouches recorded yet.",
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle("🏆 Vouch Leaderboard")
    .setColor("#FFD700");

  sorted.forEach(([userId, count], i) => {
    embed.addFields({
      name: `#${i + 1} — <@${userId}>`,
      value: `Vouches: **${count}**`,
      inline: false
    });
  });

  return interaction.reply({ embeds: [embed], ephemeral: true });
}
