// /bug/interactionHandler.js

import {
  handleBugButton,
  handleBugStatus
} from "./bugReport.js";

export default async function interactionHandler(interaction, client) {
  try {
    // Handle all bug system buttons
    if (interaction.isButton()) {
      await handleBugButton(interaction, client);
      await handleBugStatus(interaction, client);
      return;
    }

    // (If you add menus or modals later, handle them here)

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
