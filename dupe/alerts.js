import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { startCooldown, isOnCooldown, getRemaining, setCooldownEnd } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";

const ALERT_CHANNEL_ID = "1496324911084470473";
const NORMAL_PING = "967946056572747776";
const ESCALATION_PING = "750441339195490335";

export default async function alertHandler(msg, client) {
    try {
        // Prevent double-processing
        if (msg._dupeHandled) return;
        msg._dupeHandled = true;

        if (!msg.webhookId && msg.author?.bot) return;

        const content = msg.content;
        if (!content.toLowerCase().includes("amount owned")) return;

        // Extract fields
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

        const severity = getSeverityLabel(amountOwned, 0, 0);
        const color = getSeverityColor(severity);

        // Severity-based cooldown
        let cooldownSeconds = 0;
        if (severity === "YELLOW") cooldownSeconds = 240;
        else if (severity === "ORANGE") cooldownSeconds = 120;
        else if (severity === "RED") cooldownSeconds = 30;

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        // If already on cooldown, ignore new alerts
        if (isOnCooldown(playerId)) return;

        // Start cooldown
        const cooldownEnd = Date.now() + cooldownSeconds * 1000;
        setCooldownEnd(playerId, cooldownEnd);

        // Build initial embed
        const embed = new EmbedBuilder()
            .setTitle(`🚨 Possible Dupe Detected — ${severity} severity`)
            .setColor(color)
            .addFields(
                { name: "User", value: `${username} (ID: ${playerId})`, inline: false },
                { name: "Brainrot", value: brainrot, inline: true },
                { name: "Amount Owned", value: amountOwned.toString(), inline: true },
                { name: "Upgrade", value: upgrade.toString(), inline: true },
                { name: "Playtime", value: playtime, inline: false },
                { name: "Cash", value: cash, inline: false },
                { name: "=== Cooldown ===", value: `${cooldownSeconds}s remaining`, inline: false }
            )
            .setFooter({ text: `Player ID: ${playerId}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`reset_${playerId}`)
                .setLabel("Reset Cooldown")
                .setStyle(ButtonStyle.Danger)
        );

        // Ping logic
        let pingString = "";
        if (amountOwned >= 20) {
            pingString = `<@${NORMAL_PING}>`;
            if (severity === "RED") pingString += ` <@${ESCALATION_PING}>`;
        }

        // Send initial message
        const sentMessage = await channel.send({
            content: pingString,
            embeds: [embed],
            components: [row]
        });

        // LIVE COUNTDOWN LOOP
        const interval = setInterval(async () => {
            const remaining = Math.max(0, Math.floor((cooldownEnd - Date.now()) / 1000));

            if (remaining <= 0) {
                clearInterval(interval);

                const finishedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(6, 1, { name: "=== Cooldown ===", value: "Ready", inline: false });

                await sentMessage.edit({
                    embeds: [finishedEmbed],
                    components: []
                });

                return;
            }

            const updatedEmbed = EmbedBuilder.from(embed)
                .spliceFields(6, 1, { name: "=== Cooldown ===", value: `${remaining}s remaining`, inline: false });

            await sentMessage.edit({
                embeds: [updatedEmbed],
                components: [row]
            });

        }, 1000);

    } catch (err) {
        console.error("Error in alertHandler:", err);
    }
}
