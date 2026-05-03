import "./server.js";

import { Client, GatewayIntentBits, Partials } from "discord.js";

// Clean handlers
import prefix from "./prefix.js";
import alertHandler from "./dupe_DISABLED/alerts.js"; // still using dupe for now
import resetCooldown from "./dupe_DISABLED/resetCooldown.js";

// Clean merged systems (root folder)
import CooldownSystem from "./cooldownSystem.js";
import SeveritySystem from "./severitySystem.js";
import ThresholdSystem from "./thresholdSystem.js";
import VouchSystem from "./vouchSystem.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Attach systems
client.cooldownSystem = new CooldownSystem();
client.severitySystem = new SeveritySystem();
client.thresholdSystem = new ThresholdSystem();
client.vouchSystem = new VouchSystem();

client.on("messageCreate", async (msg) => {
  console.log("MAIN messageCreate fired");

  if (msg.webhookId) {
    try {
      await alertHandler(msg, client);
    } catch (err) {
      console.error("Alert error:", err);
    }
    return;
  }

  if (msg.author.bot) return;

  if (msg.content.startsWith("!")) {
    try {
      await prefix(msg, client);
    } catch (err) {
      console.error("Prefix error:", err);
    }
    return;
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    await resetCooldown(interaction, client);
  } catch (err) {
    console.error("Button error:", err);
  }
});

client.login(process.env.TOKEN);
