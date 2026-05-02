import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { isOnCooldown, getRemaining, setCooldownEnd } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";

// Unique instance ID to detect double-running bots
const INSTANCE_ID = Math.floor(Math.random() * 999999);

console.log("ALERT HANDLER DEBUG MODE ENABLED — INSTANCE:", INSTANCE_ID);

const ALERT_CHANNEL_ID = "1496324911084470473";
const NORMAL_PING = "967946056572747776";
const ESCALATION_PING = "750441339195490335";

export default async function alertHandler(msg, client) {
    try {
        // Debug: log every message that reaches alertHandler
        console.log("\n==============================");
        console.log("ALERT HANDLER TRIGGERED");
        console.log("Instance:", INSTANCE_ID);
        console.log("Message ID:", msg.id);
        console.log("Webhook ID:", msg.webhookId || "None");
        console.log("Author ID:", msg.author?.id);
        console.log("Content snippet:", msg.content.slice(0, 50));
        console.log("==============================");

        // Debug: check if message is from bot
        if (msg.author?.bot && !msg.webhookId) {
            console.log("IGNORED: Bot message (not webhook)");
            return;
        }

        // Debug: check if message contains dupe pattern
        if (!msg.content.toLowerCase().includes("amount owned")) {
            console.log("IGNORED: Missing 'amount owned' pattern");
            return;
        }

        console.log("MATCH: Dupe pattern detected");

        // Extract fields
        const userMatch = msg.content.match(/User:\s*(.+?)\s*\(ID:/i);
        const idMatch = msg.content.match(/ID:\s*(\d+)/i);
        const amountMatch = msg.content.match(/Amount owned:\s*(\d+)/i);

        if (!idMatch || !amountMatch) {
            console.log("IGNORED: Missing ID or amount");
            return;
        }

        const playerId = idMatch[1];
        const amountOwned = parseInt(amountMatch[1]);

        console.log("Parsed Player ID:", playerId);
        console.log("Parsed Amount:", amountOwned);

        // Check cooldown
        if (isOnCooldown(playerId)) {
            console.log("IGNORED: Player is on cooldown");
            return;
        }

        console.log("NO COOLDOWN: Alert will fire");

        // Determine severity
        const severity = getSeverityLabel(amountOwned, 0, 0);
        console.log("Severity:", severity);

        let cooldownSeconds = 0;
        if (severity === "YELLOW") cooldownSeconds = 240;
        else if (severity === "ORANGE") cooldownSeconds = 120;
        else if (severity === "RED") cooldownSeconds = 30;

        console.log("Cooldown seconds:", cooldownSeconds);

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) {
            console.log("ERROR: Alert channel not found");
            return;
        }

        // Start cooldown
        const cooldownEnd = Date.now() + cooldownSeconds * 1000;
        setCooldownEnd(playerId, cooldownEnd);

        console.log("Cooldown started. Ends at:", cooldownEnd);

        // Build embed
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Possible Dupe Detected — ${severity} severity`)
            .setColor(getSeverityColor(severity))
            .addFields(
                { name: "=== Cooldown ===", value: `${cooldownSeconds}s remaining`, inline: false }
            )
            .setFooter({ text: `Player ID: ${playerId} • Instance ${INSTANCE_ID}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`reset_${playerId}`)
                .setLabel("Reset Cooldown")
                .setStyle(ButtonStyle.Danger)
        );

        console.log("Sending alert embed…");

        const sentMessage = await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log("ALERT SENT SUCCESSFULLY");

        // LIVE COUNTDOWN LOOP
        const interval = setInterval(async () => {
            if (!isOnCooldown(playerId)) {
                console.log("Countdown stopped early — cooldown reset");
                clearInterval(interval);

                const finishedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(0, 1, { name: "=== Cooldown ===", value: "Ready", inline: false })
                    .setFooter({ text: `Cooldown reset by moderator • Instance ${INSTANCE_ID}` });

                await sentMessage.edit({
                    embeds: [finishedEmbed],
                    components: []
                });

                return;
            }

            const remaining = Math.max(0, Math.floor((cooldownEnd - Date.now()) / 1000));

            if (remaining <= 0) {
                console.log("Countdown finished normally");
                clearInterval(interval);

                const finishedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(0, 1, { name: "=== Cooldown ===", value: "Ready", inline: false });

                await sentMessage.edit({
                    embeds: [finishedEmbed],
                    components: []
                });

                return;
            }

            console.log("Countdown tick:", remaining);

            const updatedEmbed = EmbedBuilder.from(embed)
                .spliceFields(0, 1, { name: "=== Cooldown ===", value: `${remaining}s remaining`, inline: false });

            await sentMessage.edit({
                embeds: [updatedEmbed],
                components: [row]
            });

        }, 1000);

    } catch (err) {
        console.error("ERROR IN ALERT HANDLER:", err);
        console.error("STACK TRACE:", err.stack);
    }
}
