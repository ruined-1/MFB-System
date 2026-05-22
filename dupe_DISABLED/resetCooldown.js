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

    const oldEmbed = interaction.message.embeds[0];
    if (!oldEmbed) {
      return interaction.reply({
        content: "Could not update embed.",
        ephemeral: true
      });
    }

    // Cooldown Reset Embed Updater
    const updated = EmbedBuilder.from(oldEmbed)
      .setColor("Green")
      .setTimestamp();

      const fields = updated.data.fields?.map(f => {
        if (f.name === "Cooldown") {
          return {
          name: "Cooldown",
          value: `Cooldown reset by **<@${interaction.user.id}>**.`
          };
        }
        return f;
      });

    updated.setFields(fields);

    return interaction.update({
    embeds: [updated],
    components: []
    });
  }

  // ============================================================
  // MARK AS BANNED BUTTON
  // ============================================================
  if (id.startsWith("markbanned_")) {
    const playerId = id.replace("markbanned_", "");

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
      components: []
    });
  }

  // ============================================================
  // FALSE ALARM BUTTON
  // ============================================================
  if (id.startsWith("falsealarm_")) {
    const playerId = id.replace("falsealarm_", "");

    if (!interaction.member.permissions.has("ManageMessages")) {
      return interaction.reply({
        content: "You do not have permission to mark this as a false alarm.",
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
      .setColor("Yellow")
      .setTitle("⚠️ False Alarm — No Action Needed.")
      .setTimestamp();

    return interaction.update({
      embeds: [updated],
      components: []
    });
  }
}
