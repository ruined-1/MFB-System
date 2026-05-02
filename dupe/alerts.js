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
        if (!msg) return;

        // Allow webhook messages, block ONLY real bots
        if (!msg.webhookId && msg.author?.bot) return;

        // ============================
        // CORRECT ID RESOLVER (fixes spam)
        // ============================
        const id = msg.webhookId || msg.author?.id;

        // ============================
        // Celestial-only detection
        // ============================
        const content = msg.content.toLowerCase();
        if (!/amount\s*owned/i.test(content)) return;

        // Extract numbers
        const numbers = msg.content.match(/\d[\d,]*/g);
        if (!numbers) return;

        const cleaned = numbers.map(n => parseInt(n.replace(/,/g, ""), 10));

        const amountOwned = cleaned[0] || 0;
        const playtime = cleaned[1] || 0;
        const cash = cleaned[2] || 0;

        const severity = getSeverityLabel(amountOwned, playtime, cash);
        const color = getSeverityColor(severity);

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        // ============================
        // COOLDOWN CHECK (NO SPAM)
        // ============================
        if (isOnCooldown(id)) {
            const remaining = getRemaining(id);

            const embed = new EmbedBuilder()
                .setTitle(`⏳ Cooldown Active`)
                .setDescription(`Cooldown ends in **${remaining}s**`)
                .setColor(0xffcc00)
                .setFooter({ text: `User/Webhook ID: ${id}` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`reset_${id}`)
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

        // Start cooldown
        startCooldown(id);

        // ============================
        // NORMAL ALERT (NO SPAM)
        // ============================
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Possible Dupe Detected — ${severity} severity`)
            .setColor(color)
            .addFields(
                { name: "Amount Owned", value: amountOwned.toLocaleString(), inline: true },
                { name: "Playtime", value: playtime.toLocaleString(), inline: true },
                { name: "Cash", value: cash.toLocaleString(), inline: true }
            )
            .setFooter({ text: `User/Webhook ID: ${id}` })
            .setTimestamp();

        // ============================
        // PING LOGIC (your request)
        // ============================
        let pingString = "";

        // Only ping if amountOwned >= 20
        if (amountOwned >= 20) {
            pingString = `<@${NORMAL_PING}>`;

            // RED severity escalation
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
