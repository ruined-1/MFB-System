import express from 'express';
import { Client, GatewayIntentBits, Collection, Partials, Events } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// =========================
//  FAKE WEB SERVER (REQUIRED FOR RENDER WEB SERVICE)
// =========================
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Bot is alive');
});

app.listen(PORT, () => {
    console.log(`Fake web server running on port ${PORT}`);
});

// =========================
//  DISCORD CLIENT SETUP
// =========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.commands = new Collection();
client.buttons = new Collection();
client.cooldowns = new Map();

// Default settings
client.cooldownDuration = 15000; // 15 seconds
client.threshold = 100;          // dupe threshold

// =========================
//  LOAD SLASH COMMANDS
// =========================
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(`file://${filePath}`)).default;
    client.commands.set(command.data.name, command);
}

// =========================
//  LOAD BUTTON HANDLERS
// =========================
const buttonsPath = path.join(process.cwd(), 'buttons');

if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith('.js'));

    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);
        const handler = (await import(`file://${filePath}`)).default;
        client.buttons.set(handler.id, handler);
    }
}

// =========================
//  ALERT HANDLER
// =========================
import alertHandler from './alerts.js';

// =========================
//  INTERACTION HANDLER
// =========================
client.on(Events.InteractionCreate, async interaction => {
    // Slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            interaction.reply({
                content: 'There was an error executing this command.',
                ephemeral: true
            });
        }
    }

    // Buttons
    if (interaction.isButton()) {
        for (const [id, handler] of client.buttons.entries()) {
            // Exact match
            if (typeof handler.id === 'string' && handler.id === interaction.customId) {
                return handler.execute(interaction);
            }

            // Regex match
            if (handler.id instanceof RegExp && handler.id.test(interaction.customId)) {
                return handler.execute(interaction);
            }
        }
    }
});

// =========================
//  MESSAGE ALERTS
// =========================
client.on(Events.MessageCreate, msg => alertHandler(msg, client));
client.on(Events.MessageUpdate, (_, msg) => alertHandler(msg, client));

// =========================
//  LOGIN
// =========================
client.login(process.env.TOKEN);
