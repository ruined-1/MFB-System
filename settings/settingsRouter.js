// /settings/settingsRouter.js
import settingsInteractions, {
  handleSettingsButtons,
  handleSettingsModals
} from "./settingsInteractions.js";

export default function registerSettingsRouter(client) {
  client.on("interactionCreate", async interaction => {
    try {
      // Main handler (category switching, home, refresh, close)
      await settingsInteractions(interaction, client);

      // Button actions (toggles, open modals, etc.)
      if (interaction.isButton()) {
        await handleSettingsButtons(interaction, client);
      }

      // Modal submissions (editing values)
      if (interaction.isModalSubmit()) {
        await handleSettingsModals(interaction, client);
      }

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
