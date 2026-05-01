import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cooldowns')
        .setDescription('List all users currently on cooldown.'),

    async execute(interaction) {
        const cooldowns = interaction.client.cooldowns ?? new Map();

        if (cooldowns.size === 0) {
            return interaction.reply({
                content: `There are **no active cooldowns**.`,
                ephemeral: true
            });
        }

        const now = Date.now();
        const lines = [];

        for (const [userId, expires] of cooldowns.entries()) {
            const remaining = Math.max(0, expires - now);
            const seconds = Math.ceil(remaining / 1000);
            lines.push(`<@${userId}> — **${seconds}s** remaining`);
        }

        await interaction.reply({
            content: lines.join('\n'),
            ephemeral: true
        });
    }
};
