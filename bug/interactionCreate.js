// interactionCreate.js
import {
  handleBugButton,
  handleBugStatus
} from "./bug/bugReport.js";

export default async function interactionCreate(interaction, client) {
  try {
    // BUTTON HANDLING (Bug Report System)
    if (interaction.isButton()) {
      // Start bug report (DM form)
      await handleBugButton(interaction, client);

      // Dev-only status buttons
      await handleBugStatus(interaction, client);

      return;
    }

    // Add other interaction types here if needed (menus, modals, etc.)

  } catch (err) {
    console.error("Interaction error:", err);

    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "❌ Something went wrong handling this interaction.",
          ephemeral: true
        });
      } catch {}
    }
  }
}
