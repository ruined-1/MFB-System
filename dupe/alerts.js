import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

import { startCooldown, isOnCooldown, getRemaining } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";
import buildCooldownMessage from "./cooldownEmbed.js";

const ALERT_CHANNEL_ID = "1496324911084470473"; 
const NORMAL_PING = "967946056572747776"; 
const ESCALATION_PING = "750441339195490335"; 

export default async function alertHandler(msg, client) {
    try {
        if (!msg) return;

        // Allow webhook messages, block ONLY real bots
        if (!msg.webhookId && msg.author?.bot) return;

        // ============================
        // READ WEBHOOK CONTENT SAFELY
        // ============================
        const raw =
            msg.content ||
            msg.embeds?.[0]?.description ||
            (msg.embeds?.[0]?.fields
                ?.map(f => `${f.name}: ${f.value}`)
                .join("\n")) ||
            "";

        const content = raw.toLowerCase();

        // Only process logs that contain "amount owned"
        if (!/amount\s*owned/i.test(content)) return;

        // Extract numbers safely
        const numbers = raw.match(/\d[\d,]*/g);
        if (!numbers || numbers.length === 0) return;

        const cleanedNumbers = numbers.map(n => parseInt(n.replace(/,/g, ""), 10));

        const amountOwned = cleanedNumbers[0] || 0;
        const playtime = cleanedNumbers[1] || 0;
        const cash = cleanedNumbers[2] || 0;

        // Severity scoring
        const severity = getSeverityLabel(amountOwned, playtime, cash);
        const color = getSeverityColor(severity);

        const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
        if (!channel) return;

        // ============================
        // COOLDOWN CHECK (LIVE UPDATE)
        // ============================
        if (isOnCooldown(msg.author?.id || msg.webhookId)) {
            const id = msg.author?.id || msg.webhookId;
            const cooldownMessage = buildCooldownMessage(id);

            const sent = await channel.send({
                content: `<@${NORMAL_PING}>`,
                embeds: [cooldownMessage.embed],
                components: cooldownMessage.components
            });

            const interval = setInterval(async () => {
                const left = getRemaining(id);

                if (left <= 0) {
                    clearInterval(interval);
                    return sent.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Cooldown Ended")
                                .setDescription(`<@${id}> is no longer on cooldown.`)
                                .setColor(0x00ff00)
                        ],
                        components: []
                    });
                }

                const updated = buildCooldownMessage(id);
                await sent.edit({
                    embeds: [updated.embed],
                    components: updated.components
                });
            }, 1000);

            return;
        }

        // Start cooldown
        startCooldown(msg.author?.id || msg.webhookId);

        // ============================
        // NORMAL ALERT (NO COOLDOWN)
        // ============================
        const embed = new EmbedBuilder()
            .setTitle("🚨 Possible Dupe Detected")
            .setColor(color)
            .addFields(
                { name: "Amount Owned", value: amountOwned.toLocaleString(), inline: true },
                { name: "Playtime", value: playtime.toLocaleString(), inline: true },
                { name: "Cash", value: cash.toLocaleString(), inline: true },
                { name: "Severity", value: severity, inline: true }
            )
            .setFooter({ text: `Webhook/User ID: ${msg.author?.id || msg.webhookId}` })
            .setTimestamp();

        // RED severity escalation
        let pingString = `<@${NORMAL_PING}>`;
        if (severity === "RED") {
            pingString += ` <@${ESCALATION_PING}>`;
            embed.addFields({
                name: "Escalation",
                value: `🔴 RED severity triggered — escalation pinged.`,
                inline: false
            });
        }

        channel.send({
            content: pingString,
            embeds: [embed]
        });

    } catch (err) {
        console.error("Error in alertHandler:", err);
    }
}
