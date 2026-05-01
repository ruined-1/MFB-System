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
const LOG_CHANNEL = "1496011804634120372";
const ALERT_CHANNEL = "1496324911084470473";

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
const CASH_ORDER = ["qd", "qn", "sx", "sp", "oc", "inf"];

// =========================
// PLAYTIME SEVERITY (Option A)
// < 6h → ORANGE
// < 3h → RED
// < 1d + high cash → ORANGE
// < 1d + rare item → RED
// =========================
function parsePlaytime(str) {
    const regex = /(\d+)d\s*(\d+)h\s*(\d+)m\s*(\d+)s/i;
    const match = str.match(regex);
    if (!match) return { hours: 9999 };

    const days = parseInt(match[1]);
    const hours = parseInt(match[2]);
    const minutes = parseInt(match[3]);

    const totalHours = days * 24 + hours + minutes / 60;
    return { hours: totalHours };
}

// =========================
// CASH PARSER
// =========================
function parseCash(str) {
    const regex = /([\d.,]+)\s*([a-zA-Z]+)/;
    const match = str.match(regex);
    if (!match) return { value: 0, suffix: "qd" };

    const value = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2].toLowerCase();
    return { value, suffix };
}

// =========================
// MAIN HANDLER
// =========================
export default async function alertHandler(message, client) {
    if (!message || !message.content) return;
    if (message.author.bot) return;

    // Only read from logs channel
    if (message.channel.id !== LOG_CHANNEL) return;

    const content = message.content;

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

    const userName = userMatch[1];
    const gameId = userMatch[2];
    const brainrot = brainrotMatch[1];
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
    if (cashIndex > 0) severityScore += cashIndex;

    // Playtime rule (Option A)
    if (playtime.hours < 6) severityScore += 2;
    if (playtime.hours < 3) severityScore += 3;
    if (playtime.hours < 24 && cashIndex > 0) severityScore += 1;
    if (playtime.hours < 24 && RARE_ITEMS.some(i => brainrot.includes(i))) severityScore += 2;

    // Rare item rule
    if (RARE_ITEMS.some(i => brainrot.includes(i))) severityScore += 2;

    // If nothing suspicious, ignore
    if (severityScore < 1) return;

    // Cooldown check
    const cooldownKey = `${userName}-${gameId}`;
    if (isOnCooldown(cooldownKey)) {
        const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
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
    const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
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
