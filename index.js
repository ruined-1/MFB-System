import "dotenv/config";
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import express from "express";

// Prefix handler
import handlePrefix from "./prefix.js";

// Dupe system (alerts)
import handleAlert from "./dupe/alerts.js";

// Slash command loader
import fs from "fs";
import path from "path";

// Create client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Slash commands collection
client.commands = new Collection();

// Load slash commands from ./commands folder
const commandsPath = path.join(process.cwd(), "commands");
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
    for (const file of commandFiles) {
        const command = await import(`./commands/${file}`);
        client.commands.set(command.default.data.name, command.default);
    }
}

// Log ready
client.once("ready", () => {
    console.log("MAIN clientReady fired");
});

// Prefix + webhook + dupe alerts
client.on("messageCreate", async (msg) => {
    console.log("MAIN messageCreate fired");

    // Ignore bot messages
    if (msg.author.bot) return;

    // Prefix commands
    if (msg.content.startsWith("!")) {
        return handlePrefix(msg, client);
    }

    // Webhook alerts (dupe system)
    if (msg.webhookId) {
        return handleAlert(msg, client);
    }
});

// Slash command interactions
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.default.execute(interaction, client);
    } catch (err) {
        console.error(err);
        interaction.reply({ content: "Error executing command.", ephemeral: true });
    }
});

// Login
client.login(process.env.TOKEN);

// Keep-alive server
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(10000, () => console.log("Fake web server running on port 10000"));
