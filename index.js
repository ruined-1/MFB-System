import express from "express";
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import "dotenv/config";

// Prefix system
import prefixHandler from "./prefix.js";

// Vouch system
import "./vouches.js";

// Dupe system
import alertHandler from "./dupe/alerts.js";

// Optional uptime server
import "./server.js";

// Fake web server for Render
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// Create client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.commands = new Collection();

// Prefix + dupe system
client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    // Prefix commands
    prefixHandler(msg, client);

    // Dupe system
    alertHandler(msg, client);
});

// Dupe system for edited messages
client.on("messageUpdate", async (_, msg) => {
    if (msg.partial) await msg.fetch();
    alertHandler(msg, client);
});

// Ready
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Login
client.login(process.env.TOKEN);
