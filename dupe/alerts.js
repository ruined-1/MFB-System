import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { startCooldown, isOnCooldown, getRemaining } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";

const ALERT_CHANNEL_ID = "1496324911084470473";
const NORMAL_PING = "967946056572747776";
const ESCALATION_PING = "750441339195490335";

export default async function alertHandler(msg, client) {
    try {
        // ============================
        // DUPLICATE BLOCKER
        // ============================
        if (msg._dupeHandled) {
            console.log("[DUPLICATE BLOCKED] message ID:", msg.id);
            return;
        }
        msg._dupeHandled = true;

        if (!msg) return;

        // Allow webhook messages, block ONLY real bots
        if (!msg.webhookId && msg.author?.bot) return;

        const content = msg.content;

        // Only process Celestial logs
        if (!content.toLowerCase().includes("amount owned")) return;

        // ============================
        // EXTRACT FIELDS EXACTLY AS WEBHOOK SHOWS THEM
        // ============================

        const userMatch = content.match(/User:\s*(.+?)\s*\(ID:/i);
        const idMatch = content.match(/ID:\s*(\d+)/i);
        const brainrotMatch = content.match(/Brainrot:\s*(.+)/i);
        const amountMatch = content.match(/Amount owned:\s*(\d+)/i);
        const upgradeMatch = content.match(/Upgrade:\s*(\d+)/i);
        const playtimeMatch = content.match(/Playtime:\s*(.+)/i);
        const cashMatch = content.match(/Cash:\s*(.+)/i);

        if (!idMatch || !amountMatch) return;

        const playerId = idMatch[1];
        const username = userMatch ? userMatch[1] : "Unknown";
        const brainrot = brainrotMatch ? brainrotMatch[1] : "Unknown";
        const amountOwned = parseInt(amountMatch[1]);
        const upgrade = upgradeMatch ? upgradeMatch[1] : "Unknown";
        const playtime = playtimeMatch ? playtimeMatch[1] : "Unknown";
        const cash = cashMatch ? cashMatch[1] : "Unknown";

        // Severity based on amountOwned (your rules)
        const severity = getSeverityLabel(amountOwned, 0, 0);
        const color = getSeverityColor(severity);

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        // ============================
        // PER-USER COOLDOWN
        // ============================
        if (isOnCooldown(playerId)) {
            const remaining = getRemaining(playerId);

            const embed = new EmbedBuilder()
                .setTitle(`⏳ Cooldown Active`)
                .setDescription(`Cooldown ends in **${remaining}s**`)
                .setColor(0xffcc00)
                .setFooter({ text: `Player ID: ${playerId}` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`reset_${playerId}`)
                    .setLabel("Reset Cooldown")
                    .setStyle(ButtonStyle.Danger)
            );

            // NO PING ON COOLDOWN
            await channel.send({
                embeds: [embed],
                components: [row]
            });

            return;
        }

        // Start cooldown for THIS PLAYER ONLY
        startCooldown(playerId);

        // ============================
        // BUILD ALERT EMBED EXACTLY LIKE WEBHOOK
        // ============================
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Possible Dupe Detected — ${severity} severity`)
            .setColor(color)
            .addFields(
                { name: "User", value: `${username} (ID: ${playerId})`, inline: false },
                { name: "Brainrot", value: brainrot, inline: true },
                { name: "Amount Owned", value: amountOwned.toString(), inline: true },
                { name: "Upgrade", value: upgrade.toString(), inline: true },
                { name: "Playtime", value: playtime, inline: false },
                { name: "Cash", value: cash, inline: false }
            )
            .setFooter({ text: `Player ID: ${playerId}` })
            .setTimestamp();

        // ============================
        // PING LOGIC
        // ============================
        let pingString = "";

        if (amountOwned >= 20) {
            pingString = `<@${NORMAL_PING}>`;

            if (severity === "RED") {
                pingString += ` <@${ESCALATION_PING}>`;
            }
        }

        await channel.send({
            content: pingString,
            embeds: [embed]
        });

    } catch (err) {
        console.error("Error in alertHandler:", err);
    }
}
