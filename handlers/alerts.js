// handlers/alerts.js
import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

const cooldowns = new Map();

// ⭐ Extract first number after label
function extractNumber(label, content) {
  const regex = new RegExp(`${label}[^\\d]*(\\d+)`, "i");
  const match = content.match(regex);
  return match ? parseInt(match[1], 10) : null;
}

// ⭐ Extract full line after label
function extractText(label, content) {
  const regex = new RegExp(`${label}[^\\n]*`, "i");
  const match = content.match(regex);
  return match ? match[0].replace(label, "").trim() : null;
}

export default async function alertHandler(message, client, LOG_CHANNEL) {

  if (!message || !message.id) return;

  // Prevent double firing
  if (message._mfbAlertHandled) return;
  message._mfbAlertHandled = true;

  // Only process logs in the log channel
  if (message.channel.id !== LOG_CHANNEL) return;

  // ⭐ FETCH THE REAL MESSAGE FROM REST API
  let fullMsg;
  try {
    fullMsg = await message.channel.messages.fetch(message.id);
  } catch (err) {
    console.error("REST fetch failed:", err);
    return;
  }

  if (!fullMsg || !fullMsg.content) return;

  const content = fullMsg.content.replace(/\*\*/g, "");

  // ⭐ Only process Celestial logs
  if (!content.includes("CELESTIAL MOVE")) return;

  // ⭐ Extract fields
  const userField = extractText("User:", content);
  const brainrotField = extractText("Brainrot:", content);
  const amountOwned = extractNumber("Amount owned:", content);
  const upgradeField = extractText("Upgrade:", content);
  const playtimeField = extractText("Playtime:", content);
  const cashField = extractText("Cash:", content);

  if (!amountOwned) return;

  const threshold = global.dupeThreshold ?? 20;
  if (amountOwned < threshold) return;

  // Extract user ID from "(ID: 123456789)"
  const idMatch = content.match(/ID:\s*(\d+)/i);
  const userId = idMatch ? idMatch[1] : null;
  if (!userId) return;

  // ⭐ Cooldown logic
  const now = Date.now();
  const cooldownTime = 5 * 60 * 1000;
  const expiresAt = cooldowns.get(userId);

  if (expiresAt && now < expiresAt) return;

  cooldowns.set(userId, now + cooldownTime);

  const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
  if (!alertChannel) return;

  // ⭐ Initial embed
  const embedAlert = new EmbedBuilder()
    .setColor("#FFCC00")
    .setTitle("⚠️ Possible dupe detected (Celestial)")
    .setDescription(
      `• **User:** ${userField}\n` +
      `• **Brainrot:** ${brainrotField}\n` +
      `• **Amount owned:** ${amountOwned}\n` +
      `• **Upgrade:** ${upgradeField}\n` +
      `• **Playtime:** ${playtimeField}\n` +
      `• **Cash:** ${cashField}\n\n` +
      `⏳ **Cooldown:** 5m 0s\n` +
      `• **Source:** <#${LOG_CHANNEL}> — [Jump](${fullMsg.url})`
    )
    .setTimestamp();

  alertChannel.send({
    content: `<@${PING_USER}>`,
    embeds: [embedAlert]
  });
}
