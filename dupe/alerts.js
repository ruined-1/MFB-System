import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { startCooldown, isOnCooldown, getRemaining } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";

const ALERT_CHANNEL_ID = "1496324911084470473";
const NORMAL_PING = "";
const ESCALATION_PING = "";

export default async function alertHandler(msg, client) {
    try {
        if (!msg) return;

        // Allow webhook messages, block ONLY real bots
        if (!msg.webhookId && msg.author?.bot) return;

        // ============================
        // Celestial-only detection
        // ============================
        const content = msg.content.toLowerCase();
        if (!/amount\s*owned/i.test(content)) return;

        // ============================
        // Extract player ID from log
        // ============================
        const idMatch = msg.content.match(/ID:\s*(\d+)/i);
        if (!idMatch) return;

        const playerId = idMatch[1]; // <-- PER-USER COOLDOWN KEY

        // Extract numbers
        const numbers = msg.content.match(/\d[\d,]*/g);
        if (!numbers) return;

        const cleaned = numbers.map(n => parseInt(n.replace(/,/g, ""), 10));

        const amountOwned = cleaned[1] || 0; // first number is player ID
        const playtime = cleaned[2] || 0;
        const cash = cleaned[3] || 0;

        const severity = getSeverityLabel(amountOwned, playtime, cash);
        const color = getSeverityColor(severity);

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        // ============================
        // PER-USER COOLDOWN CHECK
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
        // NORMAL ALERT
        // ============================
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Possible Dupe Detected — ${severity} severity`)
            .setColor(color)
            .addFields(
                { name: "Amount Owned", value: amountOwned.toLocaleString(), inline: true },
                { name: "Playtime", value: playtime.toLocaleString(), inline: true },
                { name: "Cash", value: cash.toLocaleString(), inline: true }
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
