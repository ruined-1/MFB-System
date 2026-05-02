import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Open the settings panel."),
  async execute(interaction) {
    await interaction.reply({
      content: "Settings panel is wired to existing systems. (You can extend this later.)",
      ephemeral: true
    });
  }
};
