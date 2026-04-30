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

const LOG_CHANNEL = "1496324911084470473";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User]
});


// ⭐ RAW DEBUG MODE
client.on("raw", (packet) => {
  console.log("RAW EVENT:", packet.t);
});


// ⭐ Auto reconnect
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


// ⭐ When ready
client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});


// ⭐ Normal listeners
client.on("messageCreate", (msg) => prefixHandler(msg, client));
client.on("messageCreate", (msg) => alertHandler(msg, client, LOG_CHANNEL));
client.on("messageUpdate", (oldMsg, newMsg) => alertHandler(newMsg, client, LOG_CHANNEL));


// ⭐ POLLING SYSTEM — catches hidden Celestial logs
let lastMessageId = null;

setInterval(async () => {
  try {
    const channel = await client.channels.fetch(LOG_CHANNEL);
    const messages = await channel.messages.fetch({ limit: 1 });

    const msg = messages.first();
    if (!msg) return;

    if (msg.id !== lastMessageId) {
      lastMessageId = msg.id;
      alertHandler(msg, client, LOG_CHANNEL);
    }
  } catch (err) {
    console.error("Polling error:", err);
  }
}, 2000);


// ⭐ Login
client.login(process.env.TOKEN);
