import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import "dotenv/config";

// Prefix system
import prefixHandler from "./prefix.js";

// Vouch system
import "./vouches.js";

// Dupe system
import alertHandler from "./dupe/alerts.js";

// Keep the uptime server ONLY in server.js
import "./server.js";

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

    prefixHandler(msg, client);
    alertHandler(msg, client);
});

// Dupe system for edited messages
client.on("messageUpdate", async (_, msg) => {
    if (msg.partial) await msg.fetch();
    alertHandler(msg, client);
});

// ===============================
// RESET COOLDOWN BUTTON HANDLER
// ===============================
client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isButton()) return;

        if (!interaction.customId.startsWith("reset_")) return;

        const userId = interaction.customId.replace("reset_", "");

        const { resetCooldown } = await import("./dupe/cooldowns.js");

        resetCooldown(userId);

        await interaction.reply({
            content: `Cooldown reset for <@${userId}>.`,
            ephemeral: true
        });

    } catch (err) {
        console.error("Error handling reset cooldown button:", err);
    }
});

// Ready
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Login
client.login(process.env.TOKEN);
