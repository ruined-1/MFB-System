import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

import {
    startCooldown,
    isOnCooldown,
    getRemaining
} from "../utils/cooldowns.js";

import {
    getSeverityColor,
    getSeverityLabel
} from "../utils/severity.js";

// =========================
// CHANNEL CONFIG
// =========================
const CELESTIAL_LOG_CHANNEL = "1496011804634120372";
const GIFT_LOG_CHANNEL = "1488648694868742334";

// =========================
// PING TARGETS
// =========================
const REGULAR_PING = "<@967946056572747776>";
const ESCALATION_PING = "<@750441339195490335>";

// =========================
 // RARE BRAINROT ITEMS
// =========================
const RARE_ITEMS = ["SmurfCat", "MoneyPuggy", "OrcaleroOcala"];

// =========================
// CASH SUFFIX SEVERITY
// qd = safe
// anything above qd = suspicious
// =========================
const CASH_ORDER = ["b", "t", "qd", "qn", "sx", "sp", "oc", "inf"];

// =========================
// PLAYTIME PARSER
// =========================
function parsePlaytime(str) {
    // supports: "1d 4h 32m 8s" or "5h 20m 47s"
    const regex = /(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i;
    const match = str.match(regex);
    if (!match) return { hours: 9999 };

    const days = parseInt(match[1] || "0");
    const hours = parseInt(match[2] || "0");
    const minutes = parseInt(match[3] || "0");

    const totalHours = days * 24 + hours + minutes / 60;
    return { hours: totalHours };
}

// =========================
// CASH PARSER
// =========================
function parseCash(str) {
    // e.g. "18.82B", "1.07qd"
    const regex = /([\d.,]+)\s*([a-zA-Z]+)/;
    const match = str.match(regex);
    if (!match) return { value: 0, suffix: "b" };

    const value = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2].toLowerCase();
    return { value, suffix };
}

// =========================
// MAIN HANDLER
// =========================
export default async function alertHandler(message, client) {
    if (!message || !message.content) return;
    if (message.author?.bot && !message.webhookId) return;

    // Hard-ignore gift logs
    if (message.channel.id === GIFT_LOG_CHANNEL) return;

    // Only process Celestial log channel
    if (message.channel.id !== CELESTIAL_LOG_CHANNEL) return;

    const content = message.content;

    // Must be a Celestial Move
    if (!content.includes("CELESTIAL MOVE")) return;

    // =========================
    // FLEXIBLE REGEX PARSING
    // =========================
    const userMatch = content.match(/\*\*User:\*\*\s*(.+?)\s*\(ID:\s*(\d+)\)/i);
    const brainrotMatch = content.match(/\*\*Brainrot:\*\*\s*([A-Za-z0-9_]+)/i);
    const amountMatch = content.match(/\*\*Amount owned:\*\*\s*(\d+)/i);
    const playtimeMatch = content.match(/\*\*Playtime:\*\*\s*([^\n]+)/i);
    const cashMatch = content.match(/\*\*Cash:\*\*\s*([^\n]+)/i);

    if (!userMatch || !brainrotMatch || !amountMatch || !playtimeMatch || !cashMatch)
        return;

    const userName = userMatch[1].trim();
    const gameId = userMatch[2].trim();
    const brainrot = brainrotMatch[1].trim();
    const amount = parseInt(amountMatch[1]);
    const playtime = parsePlaytime(playtimeMatch[1]);
    const cash = parseCash(cashMatch[1]);

    // =========================
    // DUPE RULES
    // =========================
    let severityScore = 0;

    // Amount rule
    if (amount >= 20) severityScore += 1;

    // Cash rule
    const cashIndex = CASH_ORDER.indexOf(cash.suffix);
    if (cashIndex > 1) severityScore += cashIndex; // above qd suspicious

    // Playtime rules
    if (playtime.hours < 6) severityScore += 2;
    if (playtime.hours < 3) severityScore += 3;
    if (playtime.hours < 24 && cashIndex > 1) severityScore += 1;
    if (playtime.hours < 24 && RARE_ITEMS.some(i => brainrot.includes(i))) severityScore += 2;

    // Rare item rule
    if (RARE_ITEMS.some(i => brainrot.includes(i))) severityScore += 2;

    // If nothing suspicious, ignore
    if (severityScore < 1) return;

    // =========================
    // COOLDOWN
    // =========================
    const cooldownKey = `${userName}-${gameId}`;
    if (isOnCooldown(cooldownKey)) {
        const alertChannel = message.guild.channels.cache.get(CELESTIAL_LOG_CHANNEL);
        return sendCooldownEmbed(alertChannel, cooldownKey, client, userName, gameId);
    }

    startCooldown(cooldownKey, client.cooldownDuration);

    // =========================
    // SEVERITY LABEL + COLOR
    // =========================
    const severityLabel = getSeverityLabel(severityScore);
    const severityColor = getSeverityColor(severityScore);

    // =========================
    // PING LOGIC
    // =========================
    const finalPing =
        severityLabel === "RED"
            ? `${REGULAR_PING} ${ESCALATION_PING}`
            : REGULAR_PING;

    // =========================
    // SEND ALERT
    // =========================
    const alertChannel = message.guild.channels.cache.get("1496324911084470473"); // your alerts channel
    if (!alertChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("🚨 Dupe Alert Detected")
        .setColor(severityColor)
        .addFields(
            { name: "User", value: `${userName} (Game ID: ${gameId})`, inline: false },
            { name: "Brainrot", value: brainrot, inline: true },
            { name: "Amount Owned", value: `${amount}`, inline: true },
            { name: "Cash", value: `${cash.value}${cash.suffix}`, inline: true },
            { name: "Playtime", value: `${playtimeMatch[1]}`, inline: true },
            { name: "Severity", value: severityLabel, inline: true }
        );

    if (severityLabel === "RED") {
        embed.addFields({
            name: "Escalation",
            value: ESCALATION_PING,
            inline: false
        });
    }

    await alertChannel.send({
        content: finalPing,
        embeds: [embed]
    });
}

// =========================
// COOLDOWN EMBED
// =========================
async function sendCooldownEmbed(channel, key, client, userName, gameId) {
    if (!channel) return;

    const reply = await channel.send({
        embeds: [buildEmbed(key, client, userName, gameId)],
        components: [resetRow(key)],
        fetchReply: true
    });

    const interval = setInterval(async () => {
        const remaining = getRemaining(key);

        if (remaining <= 0) {
            clearInterval(interval);
            return reply.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Cooldown Ended")
                        .setDescription(`${userName} (${gameId}) is no longer on cooldown.`)
                        .setColor(0x00ff00)
                ],
                components: []
            });
        }

        await reply.edit({
            embeds: [buildEmbed(key, client, userName, gameId)],
            components: [resetRow(key)]
        });
    }, 1000);
}

function buildEmbed(key, client, userName, gameId) {
    const remaining = getRemaining(key);
    const seconds = Math.ceil(remaining / 1000);

    return new EmbedBuilder()
        .setTitle("⏳ Cooldown Active")
        .setDescription(`${userName} (${gameId}) is still on cooldown.`)
        .addFields(
            { name: "Time Remaining", value: `**${seconds}s**`, inline: true }
        )
        .setColor(0xffcc00);
}

function resetRow(key) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`reset_${key}`)
            .setLabel("Reset Cooldown")
            .setStyle(ButtonStyle.Danger)
    );
}
