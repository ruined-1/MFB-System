// prefix.js

import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";

import { getThreshold, setThreshold } from "./dupe/threshold.js";
import { severityLevels, setSeverityLevel } from "./dupe/severity.js";

export default async function prefixHandler(msg, client) {
    // Prevent prefix handler from running on interactions or system messages
    if (!msg || !msg.content || typeof msg.content !== "string") return;

    if (!msg.content.startsWith("!")) return;

    const args = msg.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Permission check
    const member = msg.guild?.members?.cache?.get(msg.author.id);
    if (!member || !member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return msg.reply("❌ You need **Manage Server** permissions to use this command.");
    }

    // ============================
    // !settings — unified panel
    // ============================
    if (command === "settings") {
        const embed = new EmbedBuilder()
            .setTitle("⚙️ MFB System Settings Panel")
            .setColor(0x00aaff)
            .addFields(
                { name: "📊 Threshold", value: `${getThreshold()}`, inline: false },
                { name: "🟡 YELLOW Severity", value: `${severityLevels.YELLOW}`, inline: true },
                { name: "🟠 ORANGE Severity", value: `${severityLevels.ORANGE}`, inline: true },
                { name: "🔴 RED Severity", value: `${severityLevels.RED}`, inline: true }
            )
            .setFooter({ text: "Use the buttons below to edit settings." })
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("threshold_increase")
                .setLabel("Threshold +5")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("threshold_decrease")
                .setLabel("Threshold -5")
                .setStyle(ButtonStyle.Primary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("yellow_increase")
                .setLabel("YELLOW +5")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("yellow_decrease")
                .setLabel("YELLOW -5")
                .setStyle(ButtonStyle.Success)
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("orange_increase")
                .setLabel("ORANGE +5")
                .setStyle(ButtonStyle.Warning),
            new ButtonBuilder()
                .setCustomId("orange_decrease")
                .setLabel("ORANGE -5")
                .setStyle(ButtonStyle.Warning)
        );

        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("red_increase")
                .setLabel("RED +5")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("red_decrease")
                .setLabel("RED -5")
                .setStyle(ButtonStyle.Danger)
        );

        return msg.reply({
            embeds: [embed],
            components: [row1, row2, row3, row4]
        });
    }
}
