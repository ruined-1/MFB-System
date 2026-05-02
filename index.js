// index.js

import {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

import "dotenv/config";

import prefixHandler from "./prefix.js";
import alertHandler from "./dupe/alerts.js";
import { resetCooldown } from "./dupe/cooldowns.js";
import { getThreshold, setThreshold } from "./dupe/threshold.js";
import { severityLevels, setSeverityLevel } from "./dupe/severity.js";

import "./server.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.on("messageCreate", async (msg) => {
    try {
        if (msg.author.bot && !msg.webhookId) return;

        prefixHandler(msg, client);
        alertHandler(msg, client);

    } catch (err) {
        console.error("Error in messageCreate:", err);
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isButton()) return;

        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: "❌ You need **Manage Server** permissions to edit settings.",
                ephemeral: true
            });
        }

        const id = interaction.customId;

        // Threshold buttons
        if (id === "threshold_increase") setThreshold(getThreshold() + 5);
        if (id === "threshold_decrease") setThreshold(getThreshold() - 5);

        // Severity buttons
        if (id === "yellow_increase") setSeverityLevel("YELLOW", severityLevels.YELLOW + 5);
        if (id === "yellow_decrease") setSeverityLevel("YELLOW", severityLevels.YELLOW - 5);

        if (id === "orange_increase") setSeverityLevel("ORANGE", severityLevels.ORANGE + 5);
        if (id === "orange_decrease") setSeverityLevel("ORANGE", severityLevels.ORANGE - 5);

        if (id === "red_increase") setSeverityLevel("RED", severityLevels.RED + 5);
        if (id === "red_decrease") setSeverityLevel("RED", severityLevels.RED - 5);

        // Update embed
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setFields(
                { name: "📊 Threshold", value: `${getThreshold()}`, inline: false },
                { name: "🟡 YELLOW Severity", value: `${severityLevels.YELLOW}`, inline: true },
                { name: "🟠 ORANGE Severity", value: `${severityLevels.ORANGE}`, inline: true },
                { name: "🔴 RED Severity", value: `${severityLevels.RED}`, inline: true }
            )
            .setTimestamp();

        await interaction.update({
            embeds: [embed],
            components: interaction.message.components
        });

    } catch (err) {
        console.error("Error in interactionCreate:", err);
    }
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
