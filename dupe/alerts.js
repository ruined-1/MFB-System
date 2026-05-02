import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { isOnCooldown, setCooldownEnd } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";

const ALERT_CHANNEL_ID = "1496324911084470473";
const NORMAL_PING = "967946056572747776";
const ESCALATION_PING = "750441339195490335";

// Track active countdown intervals per player
const activeCountdowns = new Map();

// Track recent request IDs to prevent duplicate alerts
const recentRequests = new Map();

// One-time send lock
const sentAlerts = new Map();

export default async function alertHandler(msg, client) {
    try {
        if (msg._mfbAlertHandled) return;
        msg._mfbAlertHandled = true;

        if (!msg.webhookId && msg.author?.bot) return;

        const content = msg.content;

        // ⭐ FLEXIBLE FULL LOG FILTER (bold or non-bold)
        const hasUser = /\*\*?User:\*\*?/i.test(content);
        const hasBrainrot = /\*\*?Brainrot:\*\*?/i.test(content);
        const hasAmount = /\*\*?Amount owned:\*\*?/i.test(content);
        const hasUpgrade = /\*\*?Upgrade:\*\*?/i.test(content);
        const hasPlaytime = /\*\*?Playtime:\*\*?/i.test(content);
        const hasCash = /\*\*?Cash:\*\*?/i.test(content);

        if (!hasUser || !hasBrainrot || !hasAmount || !hasUpgrade || !hasPlaytime || !hasCash) {
            return;
        }

        // ⭐ SAFE FLEXIBLE FIELD EXTRACTION (bold or non-bold)
        const userMatch = content.match(/\*\*?User:\*\*?\s*(.+?)\s*\(ID:/i);
        const idMatch = content.match(/ID:\s*(\d+)/i);
        const brainrotMatch = content.match(/\*\*?Brainrot:\*\*?\s*(.+)/i);
        const amountMatch = content.match(/\*\*?Amount owned:\*\*?\s*(\d+)/i);
        const upgradeMatch = content.match(/\*\*?Upgrade:\*\*?\s*(\d+)/i);
        const playtimeMatch = content.match(/\*\*?Playtime:\*\*?\s*(.+)/i);
        const cashMatch = content.match(/\*\*?Cash:\*\*?\s*(.+)/i);

        if (!idMatch || !amountMatch) return;

        const playerId = idMatch[1];
        const username = userMatch ? userMatch[1] : "Unknown";
        const brainrot = brainrotMatch ? brainrotMatch[1] : "Unknown";
        const amountOwned = parseInt(amountMatch[1]);
        const upgrade = upgradeMatch ? upgradeMatch[1] : "Unknown";
        const playtime = playtimeMatch ? playtimeMatch[1] : "Unknown";
        const cash = cashMatch ? cashMatch[1] : "Unknown";

        // ⭐ SAFETY: Prevent NaN from breaking severity/pings
        if (isNaN(amountOwned)) return;

        // Request ID
        const requestId = `${playerId}-${brainrot}-${amountOwned}-${upgrade}-${playtime}-${cash}`;

        // One-time send lock
        const now = Date.now();
        if (sentAlerts.has(requestId)) {
            const last = sentAlerts.get(requestId);
            if (now - last < 10000) return;
        }
        sentAlerts.set(requestId, now);

        // Dedupe logic
        if (recentRequests.has(requestId)) {
            const last = recentRequests.get(requestId);
            if (now - last < 10000) {
                const severity = getSeverityLabel(amountOwned, 0, 0);
                let cooldownSeconds = 0;
                if (severity === "YELLOW") cooldownSeconds = 240;
                else if (severity === "ORANGE") cooldownSeconds = 120;
                else if (severity === "RED") cooldownSeconds = 30;

                const cooldownEnd = Date.now() + cooldownSeconds * 1000;
                setCooldownEnd(playerId, cooldownEnd);
                return;
            }
        }

        recentRequests.set(requestId, now);

        const severity = getSeverityLabel(amountOwned, 0, 0);
        const color = getSeverityColor(severity);

        let cooldownSeconds = 0;
        if (severity === "YELLOW") cooldownSeconds = 240;
        else if (severity === "ORANGE") cooldownSeconds = 120;
        else if (severity === "RED") cooldownSeconds = 30;

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        if (isOnCooldown(playerId)) return;

        const cooldownEnd = Date.now() + cooldownSeconds * 1000;
        setCooldownEnd(playerId, cooldownEnd);

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
                { name: "Request ID", value: requestId, inline: false },
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

        let pingString = "";
        if (amountOwned >= 20) {
            pingString = `<@${NORMAL_PING}>`;
            if (severity === "RED") pingString += ` <@${ESCALATION_PING}>`;
        }

        const sentMessage = await channel.send({
            content: pingString,
            embeds: [embed],
            components: [row]
        });

        if (activeCountdowns.has(playerId)) {
            clearInterval(activeCountdowns.get(playerId));
        }

        const interval = setInterval(async () => {
            if (!isOnCooldown(playerId)) {
                clearInterval(interval);
                activeCountdowns.delete(playerId);

                const finishedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(7, 1, {
                        name: "=== Cooldown ===",
                        value: "Cooldown reset by moderator",
                        inline: false
                    })
                    .setFooter({ text: `Cooldown reset by moderator • Player ID: ${playerId}` });

                await sentMessage.edit({
                    embeds: [finishedEmbed],
                    components: []
                });

                return;
            }

            const remaining = Math.max(0, Math.floor((cooldownEnd - Date.now()) / 1000));

            if (remaining <= 0) {
                clearInterval(interval);
                activeCountdowns.delete(playerId);

                const finishedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(7, 1, {
                        name: "=== Cooldown ===",
                        value: "Ready",
                        inline: false
                    });

                await sentMessage.edit({
                    embeds: [finishedEmbed],
                    components: []
                });

                return;
            }

            const updatedEmbed = EmbedBuilder.from(embed)
                .spliceFields(7, 1, {
                    name: "=== Cooldown ===",
                    value: `${remaining}s remaining`,
                    inline: false
                });

            await sentMessage.edit({
                embeds: [updatedEmbed],
                components: [row]
            });

        }, 1000);

        activeCountdowns.set(playerId, interval);

    } catch (err) {
        console.error("Error in alertHandler:", err);
    }
}
