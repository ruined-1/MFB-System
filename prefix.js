// prefix.js

import {
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

import { getThreshold, setThreshold } from "./dupe/threshold.js";
import { severityLevels, setSeverityLevel } from "./dupe/severity.js";

export default async function prefixHandler(msg, client) {
    if (!msg.content.startsWith("!")) return;

    const args = msg.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Permission check
    const member = msg.guild?.members?.cache?.get(msg.author.id);
    if (!member || !member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return msg.reply("❌ You need **Manage Server** permissions to use this command.");
    }

    // ============================
    // !threshold
    // ============================
    if (command === "threshold") {
        const current = getThreshold();

        // Update threshold: !threshold 30
        if (args[0] && !isNaN(parseInt(args[0]))) {
            const newValue = parseInt(args[0]);
            setThreshold(newValue);

            const embed = new EmbedBuilder()
                .setTitle("🔧 Threshold Updated")
                .setColor(0x00ff99)
                .addFields(
                    { name: "Old Threshold", value: current.toString(), inline: true },
                    { name: "New Threshold", value: newValue.toString(), inline: true }
                )
                .setTimestamp();

            return msg.reply({ embeds: [embed] });
        }

        // Show current threshold
        const embed = new EmbedBuilder()
            .setTitle("📊 Current Threshold")
            .setColor(0x0099ff)
            .setDescription(`**Threshold:** ${current}\n\nTo update:\n\`!threshold <number>\``)
            .setTimestamp();

        return msg.reply({ embeds: [embed] });
    }

    // ============================
    // !severity
    // ============================
    if (command === "severity") {
        const level = args[0]?.toUpperCase();
        const newValue = parseInt(args[1]);

        // Update severity: !severity yellow 30
        if (level && ["YELLOW", "ORANGE", "RED"].includes(level) && !isNaN(newValue)) {
            const oldValue = severityLevels[level];
            setSeverityLevel(level, newValue);

            const embed = new EmbedBuilder()
                .setTitle("🔧 Severity Level Updated")
                .setColor(0xffcc00)
                .addFields(
                    { name: "Severity", value: level, inline: true },
                    { name: "Old Value", value: oldValue.toString(), inline: true },
                    { name: "New Value", value: newValue.toString(), inline: true }
                )
                .setTimestamp();

            return msg.reply({ embeds: [embed] });
        }

        // Show current severity settings
        const embed = new EmbedBuilder()
            .setTitle("📊 Current Severity Levels")
            .setColor(0xff9900)
            .addFields(
                { name: "🟡 YELLOW", value: severityLevels.YELLOW.toString(), inline: true },
                { name: "🟠 ORANGE", value: severityLevels.ORANGE.toString(), inline: true },
                { name: "🔴 RED", value: severityLevels.RED.toString(), inline: true }
            )
            .setFooter({ text: "To update: !severity <yellow|orange|red> <number>" })
            .setTimestamp();

        return msg.reply({ embeds: [embed] });
    }
}
