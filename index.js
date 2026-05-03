// ===============================
// WEB SERVER (Render Free Tier)
// ===============================
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// ===============================
// DISCORD BOT
// ===============================
import { Client, GatewayIntentBits, Partials } from "discord.js";

// Handlers
import prefix from "./prefix.js";
// import alertHandler from "./dupe_DISABLED/alerts.js"; // disabled
import resetCooldown from "./dupe_DISABLED/resetCooldown.js";

// Systems
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

  // Webhook handler disabled
  /*
  if (msg.webhookId) {
    try {
      await alertHandler(msg, client);
    } catch (err) {
      console.error("Alert error:", err);
    }
    return;
  }
  */

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
