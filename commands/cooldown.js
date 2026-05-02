import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { isOnCooldown, getCooldownEnd, setCooldownEnd, resetCooldown } from "../dupe/cooldowns.js";
import buildCooldownMessage from "../dupe/cooldownEmbed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("cooldown")
    .setDescription("View or manage a user's cooldown.")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("User to check or modify")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("seconds")
        .setDescription("Set cooldown duration in seconds (omit to just view)")
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName("reset")
        .setDescription("Reset this user's cooldown")
        .setRequired(false)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const seconds = interaction.options.getInteger("seconds");
    const reset = interaction.options.getBoolean("reset") || false;

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "You need **Manage Server** to use this command.",
        ephemeral: true
      });
    }

    const id = target.id;

    if (reset) {
      resetCooldown(id);
      return interaction.reply({
        content: `Cooldown reset for <@${id}>.`,
        ephemeral: true
      });
    }

    if (typeof seconds === "number") {
      const end = Date.now() + seconds * 1000;
      setCooldownEnd(id, end);
    }

    if (!isOnCooldown(id)) {
      return interaction.reply({
        content: `<@${id}> is **not** on cooldown.`,
        ephemeral: true
      });
    }

    const { embed, components } = buildCooldownMessage(id);
    await interaction.reply({
      embeds: [embed],
      components,
      ephemeral: true
    });
  }
};
// LIVE UPDATING LOOP
setInterval(async () => {
  const remaining = getRemaining(id);
  if (remaining <= 0) return;

  const { embed, components } = buildCooldownMessage(id);
  try {
    await interaction.editReply({ embeds: [embed], components });
  } catch {}
}, 1000);

