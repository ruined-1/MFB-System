import { SlashCommandBuilder } from "discord.js";
import alertHandler from "../dupe/alerts.js";

export default {
  data: new SlashCommandBuilder()
    .setName("simulatealert")
    .setDescription("Simulate a dupe alert for testing.")
    .addIntegerOption(opt =>
      opt.setName("amount")
        .setDescription("Amount owned (default: 25)")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger("amount") ?? 25;

    // Build a fake webhook-style message
    const fakeMsg = {
      webhookId: "SIMULATED_WEBHOOK",
      content: `User: TestUser (ID: 123456789)
Brainrot: TestBrainrot
Amount owned: ${amount}
Upgrade: 3
Playtime: 12h 33m
Cash: $999,999`,
      _mfbAlertHandled: false
    };

    await alertHandler(fakeMsg, client);

    await interaction.reply({
      content: `Simulated alert sent with amountOwned = **${amount}**`,
      ephemeral: true
    });
  }
};
