import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getRemaining } from './cooldowns.js';
import { getSeverityColor, getSeverityLabel } from './severity.js';

export async function sendCooldownEmbed(interaction, userId) {
    const expires = interaction.client.cooldowns.get(userId);
    const message = await interaction.reply({
        embeds: [buildEmbed(userId)],
        components: [resetRow(userId)],
        fetchReply: true
    });

    const interval = setInterval(async () => {
        const remaining = getRemaining(userId);

        if (remaining <= 0) {
            clearInterval(interval);
            return message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Cooldown Ended")
                        .setDescription(`<@${userId}> is no longer on cooldown.`)
                        .setColor(0x00FF00)
                ],
                components: []
            });
        }

        await message.edit({
            embeds: [buildEmbed(userId)],
            components: [resetRow(userId)]
        });

    }, 1000);
}

function buildEmbed(userId) {
    const remaining = getRemaining(userId);
    const seconds = Math.ceil(remaining / 1000);

    return new EmbedBuilder()
        .setTitle("User Cooldown Active")
        .setDescription(`<@${userId}> is on cooldown.`)
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
