// index.js
// ⭐ Fake web server for Render (required for free Web Service)
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));


// ⭐ Discord bot code
import {
  Client,
  GatewayIntentBits,
  Partials
} from "discord.js";

import prefixHandler from "./handlers/prefix.js";
import alertHandler from "./handlers/alerts.js";

// ⭐ THIS WAS MISSING — the channel where CELESTIAL SNITCHER POSTS
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


// ⭐ RAW DEBUG — shows what events are firing
client.on("raw", (packet) => {
  console.log("RAW EVENT:", packet.t);
});


// ⭐ Auto‑reconnect logic
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


// ⭐ When bot is ready
client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});


// ⭐ Normal messages → prefix + alerts
client.on("messageCreate", (msg) => {
  prefixHandler(msg, client);
  alertHandler({ type: "message", message: msg, client, logChannelId: LOG_CHANNEL });
});

// ⭐ Edited messages → alerts
client.on("messageUpdate", (oldMsg, newMsg) => {
  alertHandler({ type: "message", message: newMsg, client, logChannelId: LOG_CHANNEL });
});

// ⭐ Webhook updates → alerts (for game‑linked webhooks)
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


// ⭐ Login
client.login(process.env.TOKEN);
