// ⭐ Fake web server for Render (required for free Web Service)
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));


// ⭐ Discord bot code
import {
  Client,
  GatewayIntentBits
} from "discord.js";

import prefixHandler from "./handlers/prefix.js";
// import alertHandler from "./handlers/alerts.js"; // disabled for debugging

// ⭐ Create the client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// ⭐ When bot is ready
client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);

  // Debug: show what guilds the bot is actually subscribed to
  console.log("Guilds:", client.guilds.cache.map(g => g.id));
});

// ⭐ Message listener (ONLY prefix handler for now)
client.on("messageCreate", (msg) => prefixHandler(msg, client));

// ⭐ Login
client.login(process.env.TOKEN);
