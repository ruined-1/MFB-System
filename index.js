// index.js
// ⭐ Keep-alive web server (Render free plan requirement)
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));


// ⭐ Discord bot core
import {
  Client,
  GatewayIntentBits,
  Partials
} from "discord.js";

import prefixHandler from "./handlers/prefix.js";
import alertHandler, { cooldowns } from "./handlers/alerts.js";

// ⭐ REQUIRED — the channel where CELESTIAL SNITCHER POSTS
const LOG_CHANNEL = "PUT_YOUR_CELESTIAL_LOGS_CHANNEL_ID_HERE";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.User
  ]
});


// ⭐ Debug raw events (optional)
client.on("raw", (packet) => {
  console.log("RAW EVENT:", packet.t);
});


// ⭐ Auto-reconnect
client.on("error", console.error);
client.on("shardError", console.error);

client.on("disconnect", () => {
  console.log("Bot disconnected — reconnecting");
  client.login(process.env.TOKEN);
});

client.on("shardDisconnect", () => {
  console.log("Shard disconnected — reconnecting");
  client.login(process.env.TOKEN);
});


// ⭐ Bot ready
client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});


// ⭐ Prefix commands + alert detection
client.on("messageCreate", (msg) => {
  prefixHandler(msg, client);
  alertHandler({ type: "message", message: msg, client, logChannelId: LOG_CHANNEL });
});

client.on("messageUpdate", (oldMsg, newMsg) => {
  alertHandler({ type: "message", message: newMsg, client, logChannelId: LOG_CHANNEL });
});


// ⭐ Webhook update handler (for Celestial Snitcher)
client.on("raw", async (packet) => {
  if (packet.t !== "WEBHOOKS_UPDATE") return;

  const channelId = packet.d.channel_id;
  if (channelId !== LOG_CHANNEL) return;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) return;

    const messages = await channel.messages.fetch({ limit: 1 });
    const msg = messages.first();
    if (!msg) return;

    alertHandler({ type: "webhook_update", message: msg, client, logChannelId: LOG_CHANNEL });
  } catch (err) {
    console.error("WEBHOOKS_UPDATE handler error:", err);
  }
});


// ⭐ Slash command + button handling
client.on("interactionCreate", async (interaction) => {
  // Reset cooldown button
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("resetCooldown_")) {
      const userId = interaction.customId.split("_")[1];

      cooldowns.delete(userId);

      return interaction.update({
        content: `Cooldown reset by <@${interaction.user.id}>`,
        components: []
      });
    }
  }

  // Slash command: /cooldown
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "cooldown") {
      const target = interaction.options.getUser("user");
      const expiresAt = cooldowns.get(target.id);

      if (!expiresAt) {
        return interaction.reply({
          content: "No cooldown active for this user.",
          ephemeral: true
        });
      }

      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        cooldowns.delete(target.id);
        return interaction.reply({
          content: "Cooldown expired.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: `Cooldown ends <t:${Math.floor(expiresAt / 1000)}:R>`,
        ephemeral: true
      });
    }
  }
});


// ⭐ Login
client.login(process.env.TOKEN);
