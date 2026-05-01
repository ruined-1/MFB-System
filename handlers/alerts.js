import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { startCooldown, isOnCooldown, getRemaining } from './utils/cooldowns.js';
import { getSeverityColor, getSeverityLabel } from './utils/severity.js';

export default async function alertHandler(message, client) {
    if (!message || !message.content) return;
    if (message.author.bot) return;

    const userId = message.author.id;

    // === Extract number from message ===
    const match = message.content.match(/(\d[\d,]*)/);
    if (!match) return;

    const amount = parseInt(match[1].replace(/,/g, ''), 10);
    if (isNaN(amount)) return;

    // === Check threshold ===
    if (amount < client.threshold) return;

    // === If user is on cooldown, send live countdown embed ===
    if (isOnCooldown(userId)) {
        return sendCooldownEmbed(message, userId, client);
    }

    // === Start cooldown ===
    const expires = startCooldown(userId, client.cooldownDuration);

    // === Send alert embed ===
    const embed = new EmbedBuilder()
        .setTitle("🚨 Dupe Alert Triggered")
        .setDescription(`<@${userId}> posted a suspicious amount.`)
        .addFields(
            { name: "Amount", value: `**${amount.toLocaleString()}**`, inline: true },
            { name: "Threshold", value: `**${client.threshold}**`, inline: true }
        )
        .setColor(0xFF0000);

    await message.reply({ embeds: [embed] });
}

// === LIVE COUNTDOWN EMBED ===
async function sendCooldownEmbed(message, userId, client) {
    const reply = await message.reply({
        embeds: [buildEmbed(userId, client)],
        components: [resetRow(userId)],
        fetchReply: true
    });

    const interval = setInterval(async () => {
        const remaining = getRemaining(userId);

        if (remaining <= 0) {
            clearInterval(interval);
            return reply.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Cooldown Ended")
                        .setDescription(`<@${userId}> is no longer on cooldown.`)
                        .setColor(0x00FF00)
                ],
                components: []
            });
        }

        await reply.edit({
            embeds: [buildEmbed(userId, client)],
            components: [resetRow(userId)]
        });

    }, 1000);
}

function buildEmbed(userId, client) {
    const remaining = getRemaining(userId);
    const seconds = Math.ceil(remaining / 1000);

    return new EmbedBuilder()
        .setTitle("⏳ Cooldown Active")
        .setDescription(`<@${userId}> is still on cooldown.`)
        .addFields(
            { name: "Time Remaining", value: `**${seconds}s**`, inline: true },
            { name: "Severity", value: getSeverityLabel(seconds), inline: true }
        )
        .setColor(getSeverityColor(seconds));
}

function resetRow(userId) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`reset_${userId}`)
            .setLabel("Reset Cooldown")
            .setStyle(ButtonStyle.Danger)
    );
}
