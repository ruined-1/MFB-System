// resetCooldown.js
import { EmbedBuilder } from "discord.js";

export default async function resetCooldown(interaction, client) {
  if (!interaction.isButton()) return;

  const id = interaction.customId;

  // ============================================================
  // RESET COOLDOWN BUTTON
  // ============================================================
  if (id.startsWith("reset_")) {
    const playerId = id.replace("reset_", "");

    client.cooldownSystem.resetCooldown(playerId);

    return interaction.reply({
      content: `Cooldown reset for player ID **${playerId}**.`,
      ephemeral: true
    });
  }

  // ============================================================
  // MARK AS BANNED BUTTON
  // ============================================================
  if (id.startsWith("markbanned_")) {
    const playerId = id.replace("markbanned_", "");

    // Permission check
    if (!interaction.member.permissions.has("BanMembers")) {
      return interaction.reply({
        content: "You do not have permission to mark this user as banned.",
        ephemeral: true
      });
    }

    const oldEmbed = interaction.message.embeds[0];
    if (!oldEmbed) {
      return interaction.reply({
        content: "Could not update embed.",
        ephemeral: true
      });
    }

    const updated = EmbedBuilder.from(oldEmbed)
      .setColor("Green")
      .setTitle("✅ User has been banned.")
      .setTimestamp();

    return interaction.update({
      embeds: [updated],
      components: [] // remove buttons
    });
  }
}
