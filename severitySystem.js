// severitySystem.js
/* import { EmbedBuilder } from "discord.js";

export const severityLevels = {
  YELLOW: 20,
  ORANGE: 50,
  RED: 100
};

export function getSeverityLabel(amount) {
  if (amount >= severityLevels.RED) return "RED";
  if (amount >= severityLevels.ORANGE) return "ORANGE";
  if (amount >= severityLevels.YELLOW) return "YELLOW";
  return "LOW";
}

export function getSeverityColor(severity) {
  switch (severity) {
    case "RED": return 0xff0000;
    case "ORANGE": return 0xffa500;
    case "YELLOW": return 0xf5e342; // correct yellow
    default: return 0x00ff00;
  }
}

export default class SeveritySystem {
  testSeverity(msg, args) {
    const amount = parseInt(args[0]);
    if (isNaN(amount)) return msg.reply("Provide a number.");

    const severity = getSeverityLabel(amount);
    const color = getSeverityColor(severity);

    const embed = new EmbedBuilder()
      .setTitle(`Severity Test: ${severity}`)
      .setColor(color)
      .addFields({ name: "Amount", value: amount.toString() });

    return msg.reply({ embeds: [embed] });
  }
} */
