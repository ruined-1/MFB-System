import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } from "discord.js";
import "dotenv/config";

import prefixHandler from "./prefix.js";
import alertHandler from "./dupe/alerts.js";
import { resetCooldown } from "./dupe/cooldowns.js";
import "./server.js"; // REQUIRED for Render

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.commands = new Collection();

// ⭐ SINGLE messageCreate listener — no duplicates
client.on("messageCreate", async (msg) => {
    try {
        // Ignore bot messages unless they are webhooks
        if (msg.author.bot && !msg.webhookId) return;

        // Prefix commands
        prefixHandler(msg, client);

        // Dupe alert handler
        alertHandler(msg, client);

    } catch (err) {
        console.error("Error in messageCreate:", err);
    }
});

// ⭐ Reset button handler
client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("reset_")) return;

        const userId = interaction.customId.replace("reset_", "");

        resetCooldown(userId);

        await interaction.deferUpdate();

        const msg = interaction.message;

        const embed = EmbedBuilder.from(msg.embeds[0])
            .spliceFields(7, 1, {
                name: "=== Cooldown ===",
                value: "Cooldown reset by moderator",
                inline: false
            })
            .setFooter({ text: `Cooldown reset by moderator • Player ID: ${userId}` });

        await msg.edit({
            embeds: [embed],
            components: []
        });

    } catch (err) {
        console.error("Error handling reset cooldown button:", err);
    }
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
