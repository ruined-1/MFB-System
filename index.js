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


// ⭐ Your log channel ID for alerts
const LOG_CHANNEL = "1496324911084470473";


// ⭐ Create the client with FULL gateway subscription
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User
  ]
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


// ⭐ Message listeners (BOTH handlers)
client.on("messageCreate", (msg) => prefixHandler(msg, client));
client.on("messageCreate", (msg) => alertHandler(msg, client, LOG_CHANNEL));


// ⭐ Login
client.login(process.env.TOKEN);
