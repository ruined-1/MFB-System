import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setcooldown')
        .setDescription('Set the cooldown duration in seconds.')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Cooldown duration')
                .setRequired(true)
        ),

    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');

        interaction.client.cooldownDuration = seconds * 1000;

        await interaction.reply({
            content: `Cooldown duration set to **${seconds} seconds**.`,
            ephemeral: true
        });
    }
};
