// resetCooldown.js

export default async function resetCooldown(interaction, client) {
  if (!interaction.isButton()) return;

  const id = interaction.customId.replace("reset_", "");

  client.cooldownSystem.resetCooldown(id);

  await interaction.reply({
    content: `Cooldown reset for player ID **${id}**.`,
    ephemeral: true
  });
}
