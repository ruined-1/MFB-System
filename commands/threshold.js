import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getThreshold, setThreshold } from "../dupe/threshold.js";

export default {
  data: new SlashCommandBuilder()
    .setName("threshold")
    .setDescription("View or set the dupe threshold.")
    .addIntegerOption(opt =>
      opt.setName("value")
        .setDescription("New threshold value")
        .setRequired(false)
    ),
  async execute(interaction) {
    const value = interaction.options.getInteger("value");

    if (value === null) {
      return interaction.reply({
        content: `Current threshold: **${getThreshold()}**`,
        ephemeral: true
      });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "You need **Manage Server** to change the threshold.",
        ephemeral: true
      });
    }

    setThreshold(value);
    await interaction.reply({
      content: `Threshold updated to **${value}**.`,
      ephemeral: true
    });
  }
};
