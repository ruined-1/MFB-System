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

// ⭐ Create the client with FULL gateway subscription
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,          // ⭐ REQUIRED for full guild subscription
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User
  ]
});

// ⭐ When bot is ready
client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
  console.log("Guilds:", client.guilds.cache.map(g => g.id));
});

// ⭐ Message listener
client.on("messageCreate", (msg) => prefixHandler(msg, client));

// ⭐ Login
client.login(process.env.TOKEN);
