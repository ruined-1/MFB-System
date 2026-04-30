// ⭐ Cooldown reset button + /cooldown command
import { cooldowns } from "./handlers/alerts.js"; // if needed, export it

client.on("interactionCreate", async (interaction) => {
  // Reset button
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("resetCooldown_")) {
      const userId = interaction.customId.split("_")[1];

      cooldowns.delete(userId);

      return interaction.update({
        content: `Cooldown reset by <@${interaction.user.id}>`,
        components: []
      });
    }
  }

  // Slash command: /cooldown
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "cooldown") {
      const target = interaction.options.getUser("user");
      const expiresAt = cooldowns.get(target.id);

      if (!expiresAt) {
        return interaction.reply({
          content: "No cooldown active for this user.",
          ephemeral: true
        });
      }

      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        cooldowns.delete(target.id);
        return interaction.reply({
          content: "Cooldown expired.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `Cooldown ends in <t:${Math.floor(expiresAt / 1000)}:R>`,
        ephemeral: true
      });
    }
  }
});
