// ===============================
// FORCE OLD INSTANCE TO SHUT DOWN
// ===============================
process.on("SIGTERM", () => {
  console.log("Received SIGTERM — shutting down immediately to avoid overlap");
  process.exit(0);
});

// Optional: small delay to let old instance die before logging in
const startupDelay = async () => {
  await new Promise(res => setTimeout(res, 2000));
};
await startupDelay();

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
import { Client, GatewayIntentBits } from "discord.js";

// Handlers
import prefix from "./prefix.js";
import alertHandler from "./dupe_DISABLED/alerts.js";
import resetCooldown from "./dupe_DISABLED/resetCooldown.js";
import boostTracker from "./boostTracker.js";   // ⭐ BOOST TRACKER

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
  partials: []
});

// Attach systems
client.cooldownSystem = new CooldownSystem();
client.severitySystem = new SeveritySystem();
client.thresholdSystem = new ThresholdSystem();
client.vouchSystem = new VouchSystem();

// ===============================
// MESSAGE HANDLER (PREFIX COMMANDS)
// ===============================
client.on("messageCreate", async (msg) => {
  if (msg.partial) return;
  if (msg.author.bot) return;

  console.log("MAIN messageCreate fired");

  if (msg.content.startsWith("!")) {
    try {
      await prefix(msg, client);
    } catch (err) {
      console.error("Prefix error:", err);
    }
  }
});

// ===============================
// MESSAGE HANDLER (ALERT SYSTEM)
// ===============================
client.on("messageCreate", async (msg) => {
  try {
    await alertHandler(msg, client);
  } catch (err) {
    console.error("Alert handler error:", err);
  }
});

// ===============================
// MESSAGE HANDLER (BOOST TRACKER)
// ===============================
client.on("messageCreate", async (msg) => {
  try {
    await boostTracker(msg, client);
  } catch (err) {
    console.error("Boost tracker error:", err);
  }
});

// ===============================
// BUTTON HANDLER
// ===============================
client.on("interactionCreate", async (interaction) => {
  try {
    await resetCooldown(interaction, client);
  } catch (err) {
    console.error("Button error:", err);
  }
});

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
