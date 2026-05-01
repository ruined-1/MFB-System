import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('threshold')
        .setDescription('Set the dupe alert threshold.')
        .addIntegerOption(option =>
            option.setName('value')
                .setDescription('New threshold value')
                .setRequired(true)
        ),

    async execute(interaction) {
        const value = interaction.options.getInteger('value');

        interaction.client.threshold = value;

        await interaction.reply({
            content: `Threshold updated to **${value}**.`,
            ephemeral: true
        });
    }
};
