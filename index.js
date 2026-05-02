import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
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
    // ============================
    // DEBUG LOG
    // ============================
    console.log("[messageCreate DEBUG]", {
        id: msg.id,
        webhookId: msg.webhookId,
        authorId: msg.author?.id,
        authorBot: msg.author?.bot,
        channelId: msg.channelId,
        content: msg.content
    });

    if (msg.author.bot && !msg.webhookId) return;

    prefixHandler(msg, client);
    alertHandler(msg, client);
});

client.on("messageUpdate", async (_, msg) => {
    if (msg.partial) await msg.fetch();
    alertHandler(msg, client);
});

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

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
