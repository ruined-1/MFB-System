import "./server.js";

import { Client, GatewayIntentBits, Partials } from "discord.js";

// Clean systems
import VouchSystem from "./vouchSystem.js";
import CooldownSystem from "./cooldownSystem.js";
import SeveritySystem from "./severitySystem.js";
import ThresholdSystem from "./thresholdSystem.js";

// Clean handlers
import prefix from "./prefix.js";
import alertHandler from "./alerts.js";
import buttonHandler from "./buttonHandler.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Attach systems to client
client.vouchSystem = new VouchSystem();
client.cooldownSystem = new CooldownSystem();
client.severitySystem = new SeveritySystem();
client.thresholdSystem = new ThresholdSystem();

// MAIN MESSAGE HANDLER
client.on("messageCreate", async (msg) => {
  console.log("MAIN messageCreate fired");

  // 1. ALERTS FIRST (webhook logs)
  if (msg.webhookId) {
    try {
      await alertHandler(msg, client);
    } catch (err) {
      console.error("Alert error:", err);
    }
    return;
  }

  // 2. Ignore bot messages
  if (msg.author.bot) return;

  // 3. PREFIX COMMANDS
  if (msg.content.startsWith("!")) {
    try {
      await prefix(msg, client);
    } catch (err) {
      console.error("Prefix error:", err);
    }
    return;
  }
});

// BUTTON HANDLER (reset cooldown)
client.on("interactionCreate", async (interaction) => {
  try {
    await buttonHandler(interaction, client);
  } catch (err) {
    console.error("Button error:", err);
  }
});

client.login(process.env.TOKEN);
