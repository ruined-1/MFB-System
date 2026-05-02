import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { vouches } from "../vouches.js";
import { saveVouches } from "../saveVouches.js";

export default {
  data: new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Record a vouch for a user.")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("User you are vouching for")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Reason for the vouch")
        .setRequired(false)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided.";

    // Optional: restrict to users with Manage Guild
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "You need **Manage Server** to use this command.",
        ephemeral: true
      });
    }

    const data = { ...vouches };
    const id = target.id;

    if (!data[id]) data[id] = 0;
    data[id] += 1;

    saveVouches(data);

    await interaction.reply({
      content: `Vouch recorded for <@${id}>. Total vouches: **${data[id]}**\nReason: ${reason}`,
      ephemeral: false
    });
  }
};
