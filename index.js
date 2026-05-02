import { Client, GatewayIntentBits, Partials } from "discord.js";
import alertHandler from "./dupe/alerts.js";
import handlePrefix from "./prefix.js";
import handleReset from "./dupe/resetCooldown.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.on("messageCreate", async (msg) => {
  console.log("MAIN messageCreate fired");

  // 1. ALERTS FIRST
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
      await handlePrefix(msg, client);
    } catch (err) {
      console.error("Prefix error:", err);
    }
    return;
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("reset_")) {
    return handleReset(interaction);
  }
});

client.login(process.env.TOKEN);
