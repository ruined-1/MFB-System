// /settings/settingsRouter.js
import settingsInteractions from "./settingsInteractions.js";

export default function registerSettingsRouter(client) {
  client.on("interactionCreate", async interaction => {
    try {
      // The interactions file handles:
      // - category switching
      // - buttons
      // - modals
      // - updates
      // - replies
      await settingsInteractions(interaction, client);

    } catch (err) {
      console.error("Settings system error:", err);
      try {
        await interaction.reply({
          content: "❌ An error occurred while processing this settings action.",
          ephemeral: true
        });
      } catch {}
    }
  });
}
