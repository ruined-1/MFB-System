import { startCooldown, isOnCooldown, getRemaining } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";
import buildCooldownEmbed from "./cooldownEmbed.js";

const ALERT_CHANNEL_ID = "1496324911084470473"; // Your alert channel

export default async function alertHandler(msg, client) {
    try {
        if (!msg || !msg.content) return;
        if (msg.author?.bot) return;

        const content = msg.content.toLowerCase();

        // Only process logs that contain "amount owned"
        if (!content.includes("amount owned")) return;

        // Extract numbers safely
        const numbers = content.match(/\d[\d,]*/g);
        if (!numbers || numbers.length === 0) return;

        const cleanedNumbers = numbers.map(n => parseInt(n.replace(/,/g, ""), 10));

        const amountOwned = cleanedNumbers[0] || 0;
        const playtime = cleanedNumbers[1] || 0;
        const cash = cleanedNumbers[2] || 0;

        // Severity scoring
        const severity = getSeverityLabel(amountOwned, playtime, cash);
        const color = getSeverityColor(severity);

        // Cooldown check
        if (isOnCooldown(msg.author.id)) {
            const remaining = getRemaining(msg.author.id);
            const embed = buildCooldownEmbed(msg.author, remaining);
            const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
            if (channel) channel.send({ embeds: [embed] });
            return;
        }

        // Start cooldown
        startCooldown(msg.author.id);

        // Build alert embed
        const embed = {
            title: `🚨 Possible Dupe Detected`,
            color: color,
            fields: [
                { name: "Amount Owned", value: amountOwned.toLocaleString(), inline: true },
                { name: "Playtime", value: playtime.toLocaleString(), inline: true },
                { name: "Cash", value: cash.toLocaleString(), inline: true },
                { name: "Severity", value: severity, inline: true }
            ],
            footer: { text: `User ID: ${msg.author.id}` },
            timestamp: new Date()
        };

        // Send alert
        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (channel) channel.send({ embeds: [embed] });

    } catch (err) {
        console.error("Error in alertHandler:", err);
    }
}
