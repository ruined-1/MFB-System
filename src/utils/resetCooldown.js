import { clearCooldown } from '../utils/cooldowns.js';

export default {
    id: /^reset_(\d+)$/,
    async execute(interaction) {
        const userId = interaction.customId.split("_")[1];
        clearCooldown(userId);

        await interaction.update({
            content: `Cooldown reset for <@${userId}>.`,
            embeds: [],
            components: []
        });
    }
};
