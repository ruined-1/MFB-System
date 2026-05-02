import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } from "discord.js";
import "dotenv/config";

import prefixHandler from "./prefix.js";
import "./vouches.js";
import alertHandler from "./dupe/alerts.js";
import "./server.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.commands = new Collection();

client.on("messageCreate", async (msg) => {
    try {
        // Allow webhook + humans, block bots
        if (msg.author.bot && !msg.webhookId) return;

        prefixHandler(msg, client);
        alertHandler(msg, client);

    } catch (err) {
        console.error("Error in messageCreate:", err);
    }
});

// ===============================
// FIXED RESET BUTTON HANDLER
// ===============================
client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("reset_")) return;

        const userId = interaction.customId.replace("reset_", "");
        const { resetCooldown } = await import("./dupe/cooldowns.js");

        // Reset internal cooldown
        resetCooldown(userId);

        // Acknowledge button press WITHOUT replying
        await interaction.deferUpdate();

        // Edit the message to show cooldown ended
        const msg = interaction.message;
        const embed = EmbedBuilder.from(msg.embeds[0])
            .setFooter({ text: `Cooldown reset by moderator • Player ID: ${userId}` })
            .spliceFields(6, 1, { name: "=== Cooldown ===", value: "Ready", inline: false });

        await msg.edit({
            embeds: [embed],
            components: [] // remove reset button
        });

    } catch (err) {
        console.error("Error handling reset cooldown button:", err);
    }
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
