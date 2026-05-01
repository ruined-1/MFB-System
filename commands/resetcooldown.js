import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resetcooldown')
        .setDescription('Reset cooldown for a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to reset')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const cooldowns = interaction.client.cooldowns ?? new Map();

        cooldowns.delete(user.id);

        await interaction.reply({
            content: `Cooldown reset for **${user.username}**.`,
            ephemeral: true
        });
    }
};
