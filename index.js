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

// ===============================
// MESSAGE HANDLER
// ===============================
client.on("messageCreate", async (msg) => {
    try {
        // Ignore only real bot accounts
        if (msg.author?.bot) return;

        // Prefix commands (settings panel)
        prefixHandler(msg, client);

        // Alerts (unchanged)
        alertHandler(msg, client);

    } catch (err) {
        console.error("Error in messageCreate:", err);
    }
});

// ===============================
// BUTTON INTERACTIONS
// ===============================
client.on("interactionCreate", async (interaction) => {
    try {
        if (!interaction.isButton()) return;

        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: "❌ You need **Manage Server** permissions to edit settings or cooldowns.",
                ephemeral: true
            });
        }

        const id = interaction.customId;

        // ============================
        // RESET COOLDOWN BUTTON
        // ============================
        if (id.startsWith("reset_")) {
            const playerId = id.replace("reset_", "");

            // Clear cooldown for this player
            resetCooldown(playerId);

            // Clone the existing embed
            const oldEmbed = interaction.message.embeds[0];
            const embed = EmbedBuilder.from(oldEmbed)
                .setFields(
                    ...oldEmbed.fields.filter(f => f.name !== "=== Cooldown ==="),
                    {
                        name: "=== Cooldown ===",
                        value: "✅ Cooldown manually reset.",
                        inline: false
                    }
                )
                .setTimestamp();

            // Disable the button after use
            const disabledComponents = interaction.message.components.map(row => {
                return {
                    ...row,
                    components: row.components.map(comp => {
                        if (comp.customId === id) {
                            return { ...comp, disabled: true };
                        }
                        return comp;
                    })
                };
            });

            return interaction.update({
                embeds: [embed],
                components: disabledComponents
            });
        }

        // ============================
        // SETTINGS PANEL BUTTONS
        // ============================
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

        // Update settings panel embed
        if (
            id === "threshold_increase" ||
            id === "threshold_decrease" ||
            id === "yellow_increase" ||
            id === "yellow_decrease" ||
            id === "orange_increase" ||
            id === "orange_decrease" ||
            id === "red_increase" ||
            id === "red_decrease"
        ) {
            const embed = EmbedBuilder.from(interaction.message.embeds[0])
                .setFields(
                    { name: "📊 Threshold", value: `${getThreshold()}`, inline: false },
                    { name: "🟡 YELLOW Severity", value: `${severityLevels.YELLOW}`, inline: true },
                    { name: "🟠 ORANGE Severity", value: `${severityLevels.ORANGE}`, inline: true },
                    { name: "🔴 RED Severity", value: `${severityLevels.RED}`, inline: true }
                )
                .setTimestamp();

            return interaction.update({
                embeds: [embed],
                components: interaction.message.components
            });
        }

    } catch (err) {
        console.error("Error in interactionCreate:", err);
    }
});

// ===============================
// READY
// ===============================
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
