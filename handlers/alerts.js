// handlers/alerts.js
import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";
const ESCALATION_PING = "775991906173452288";

const cooldowns = new Map();

// Extract helpers
function extractNumber(label, content) {
  const regex = new RegExp(`${label}[^\\d]*(\\d+)`, "i");
  const match = content.match(regex);
  return match ? parseInt(match[1], 10) : null;
}

function extractText(label, content) {
  const regex = new RegExp(`${label}[^\\n]*`, "i");
  const match = content.match(regex);
  return match ? match[0].replace(label, "").trim() : null;
}

// Determine severity
function determineSeverity(amountOwned, playtimeField, cashField, upgradeField, brainrotField) {
  let severity = "YELLOW";

  // Base thresholds (Option A)
  if (amountOwned >= 100) severity = "RED";
  else if (amountOwned >= 50) severity = "ORANGE";
  else if (amountOwned >= 20) severity = "YELLOW";

  // Dynamic modifiers (Option B)
  const playtimeLow = /(\d+d\s*)?(\d+h\s*)?(\d+m)/i.test(playtimeField) && playtimeField.includes("0h");
  const cashHigh = /(qd|sx|inf)$/i.test(cashField);
  const upgradeHigh = parseInt(upgradeField) > 200;
  const brainrotSuspicious = /moneypuggy/i.test(brainrotField);

  if (severity === "YELLOW" && playtimeLow) severity = "ORANGE";
  if (severity === "YELLOW" && cashHigh) severity = "RED";
  if (severity === "YELLOW" && brainrotSuspicious) severity = "ORANGE";

  if (severity === "ORANGE" && cashHigh) severity = "RED";
  if (severity === "ORANGE" && upgradeHigh) severity = "RED";

  return severity;
}

export default async function alertHandler(ctx) {
  const { message, logChannelId } = ctx;
  if (!message || !message.id) return;

  if (message._mfbAlertHandled) return;
  message._mfbAlertHandled = true;

  if (!message.channel || message.channel.id !== logChannelId) return;

  // Try direct content first
  let content = message.content?.trim();

  // REST fallback
  if (!content || content.length === 0) {
    try {
      const fullMsg = await message.channel.messages.fetch(message.id);
      if (fullMsg && fullMsg.content) content = fullMsg.content.trim();
    } catch {
      return;
    }
  }

  if (!content || content.length === 0) return;

  content = content.replace(/\*\*/g, "");

  if (!content.includes("CELESTIAL MOVE")) return;

  // Extract fields
  const userField = extractText("User:", content);
  const brainrotField = extractText("Brainrot:", content);
  const amountOwned = extractNumber("Amount owned:", content);
  const upgradeField = extractText("Upgrade:", content);
  const playtimeField = extractText("Playtime:", content);
  const cashField = extractText("Cash:", content);

  if (!amountOwned) return;

  const threshold = global.dupeThreshold ?? 20;
  if (amountOwned < threshold) return;

  const idMatch = content.match(/ID:\s*(\d+)/i);
  const userId = idMatch ? idMatch[1] : null;
  if (!userId) return;

  // Cooldown
  const now = Date.now();
  const cooldownTime = 5 * 60 * 1000;
  const expiresAt = cooldowns.get(userId);

  if (expiresAt && now < expiresAt) return;
  cooldowns.set(userId, now + cooldownTime);

  // ⭐ Determine severity
  const severity = determineSeverity(amountOwned, playtimeField, cashField, upgradeField, brainrotField);

  // Severity colors
  const severityColors = {
    YELLOW: "#FFD93D",
    ORANGE: "#FF8C42",
    RED: "#FF3B30"
  };

  const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
  if (!alertChannel) return;

  // Build embed
  const embedAlert = new EmbedBuilder()
    .setColor(severityColors[severity])
    .setTitle(`⚠️ Possible dupe detected — ${severity} severity`)
    .setDescription(
      `• **User:** ${userField}\n` +
      `• **Brainrot:** ${brainrotField}\n` +
      `• **Amount owned:** ${amountOwned}\n` +
      `• **Upgrade:** ${upgradeField}\n` +
      `• **Playtime:** ${playtimeField}\n` +
      `• **Cash:** ${cashField}\n\n` +
      `⏳ **Cooldown:** 5m 0s\n` +
      `• **Source:** <#${logChannelId}>`
    )
    .setTimestamp();

  // ⭐ RED severity escalation ping
  const pingString =
    severity === "RED"
      ? `<@${PING_USER}> <@${ESCALATION_PING}>`
      : `<@${PING_USER}>`;

  await alertChannel.send({
    content: pingString,
    embeds: [embedAlert]
  });
}
