import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cooldown')
        .setDescription('Check your remaining cooldown.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldowns = interaction.client.cooldowns ?? new Map();

        if (!cooldowns.has(userId)) {
            return interaction.reply({
                content: `You are **not** on cooldown.`,
                ephemeral: true
            });
        }

        const expires = cooldowns.get(userId);
        const remaining = Math.max(0, expires - Date.now());

        if (remaining <= 0) {
            cooldowns.delete(userId);
            return interaction.reply({
                content: `You are **not** on cooldown.`,
                ephemeral: true
            });
        }

        const seconds = Math.ceil(remaining / 1000);

        await interaction.reply({
            content: `You have **${seconds} seconds** remaining.`,
            ephemeral: true
        });
    }
};
