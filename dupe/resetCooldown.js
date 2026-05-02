import { resetCooldown } from "./cooldowns.js";

export default async function handleReset(interaction) {
  const id = interaction.customId.replace("reset_", "");

  resetCooldown(id);

  await interaction.reply({
    content: `Cooldown reset for player ID **${id}**.`,
    ephemeral: true
  });
}
