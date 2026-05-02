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

// Prevent duplicate alerts for identical logs
const recentRequests = new Map();

export default async function alertHandler(msg, client) {
    try {
        // Only process webhook messages
        if (!msg.webhookId) return;

        const content = msg.content;

        // FLEXIBLE FIELD DETECTION
        const hasUser = /User:/i.test(content);
        const hasBrainrot = /Brainrot:/i.test(content);
        const hasAmount = /Amount owned:/i.test(content);
        const hasUpgrade = /Upgrade:/i.test(content);
        const hasPlaytime = /Playtime:/i.test(content);
        const hasCash = /Cash:/i.test(content);

        if (!hasUser || !hasBrainrot || !hasAmount || !hasUpgrade || !hasPlaytime || !hasCash) {
            return;
        }

        // SAFE EXTRACTION
        const userMatch = content.match(/User:\s*(.+?)\s*\(ID:/i);
        const idMatch = content.match(/ID:\s*(\d+)/i);
        const brainrotMatch = content.match(/Brainrot:\s*(.+)/i);
        const amountMatch = content.match(/Amount owned:\s*(\d+)/i);
        const upgradeMatch = content.match(/Upgrade:\s*(\d+)/i);
        const playtimeMatch = content.match(/Playtime:\s*(.+)/i);
        const cashMatch = content.match(/Cash:\s*(.+)/i);

        if (!userMatch || !idMatch || !brainrotMatch || !amountMatch || !upgradeMatch || !playtimeMatch || !cashMatch) {
            return;
        }

        const playerId = idMatch[1];
        const username = userMatch[1];
        const brainrot = brainrotMatch[1];
        const amountOwned = parseInt(amountMatch[1]);
        const upgrade = upgradeMatch[1];
        const playtime = playtimeMatch[1];
        const cash = cashMatch[1];

        if (isNaN(amountOwned)) return;

        // THRESHOLD CHECK — ignore logs under 20
        if (amountOwned < 20) return;

        // DEDUPE KEY
        const requestId = `${playerId}-${brainrot}-${amountOwned}-${upgrade}-${playtime}-${cash}`;
        const now = Date.now();

        // Prevent duplicate alerts within 10 seconds
        if (recentRequests.has(requestId)) {
            const last = recentRequests.get(requestId);
            if (now - last < 10000) return;
        }
        recentRequests.set(requestId, now);

        // SEVERITY (correct signature)
        const severity = getSeverityLabel(amountOwned);

        // COLOR (correct signature)
        const color = getSeverityColor(amountOwned);

        // COOLDOWN SECONDS (Option A)
        let cooldownSeconds = 0;
        if (severity === "YELLOW") cooldownSeconds = 240;
        else if (severity === "ORANGE") cooldownSeconds = 120;
        else if (severity === "RED") cooldownSeconds = 30;

        // COOLDOWN CHECK
        if (isOnCooldown(playerId)) return;

        // START COOLDOWN
        const cooldownEnd = Date.now() + cooldownSeconds * 1000;
        const cooldownUnix = Math.floor(cooldownEnd / 1000);
        setCooldownEnd(playerId, cooldownEnd);

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        // BUILD EMBED
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
                { name: "Cooldown", value: `<t:${cooldownUnix}:R>`, inline: false }
            )
            .setFooter({ text: `Player ID: ${playerId}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`reset_${playerId}`)
                .setLabel("Reset Cooldown")
                .setStyle(ButtonStyle.Danger)
        );

        // PING LOGIC
        let pingString = `<@${NORMAL_PING}>`;
        if (severity === "RED") pingString += ` <@${ESCALATION_PING}>`;

        await channel.send({
            content: pingString,
            embeds: [embed],
            components: [row]
        });

    } catch (err) {
        console.error("Error in alertHandler:", err);
    }
}
