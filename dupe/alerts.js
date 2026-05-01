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
const NORMAL_PING = "9679460565727477476"; 
const ESCALATION_PING = "750441339195490335"; 

export default async function alertHandler(msg, client) {
    try {
        if (!msg || !msg.content) return;
        if (msg.author?.bot) return;

        const content = msg.content.toLowerCase();
        if (!content.includes("amount owned")) return;

        const numbers = content.match(/\d[\d,]*/g);
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
        // COOLDOWN CHECK (LIVE UPDATE)
        // ============================
        if (isOnCooldown(msg.author.id)) {
            const cooldownMessage = buildCooldownMessage(msg.author.id);

            const sent = await channel.send({
                content: `<@${NORMAL_PING}>`,
                embeds: [cooldownMessage.embed],
                components: cooldownMessage.components
            });

            const interval = setInterval(async () => {
                const left = getRemaining(msg.author.id);

                if (left <= 0) {
                    clearInterval(interval);
                    return sent.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Cooldown Ended")
                                .setDescription(`<@${msg.author.id}> is no longer on cooldown.`)
                                .setColor(0x00ff00)
                        ],
                        components: []
                    });
                }

                const updated = buildCooldownMessage(msg.author.id);
                await sent.edit({
                    embeds: [updated.embed],
                    components: updated.components
                });
            }, 1000);

            return;
        }

        // Start cooldown
        startCooldown(msg.author.id);

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
            .setFooter({ text: `User ID: ${msg.author.id}` })
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
