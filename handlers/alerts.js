// handlers/alerts.js
import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

const cooldowns = new Map();

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

export default function alertHandler(message, client, LOG_CHANNEL) {

  if (!message || !message.content) return;

  // Prevent double firing
  if (message._mfbAlertHandled) return;
  message._mfbAlertHandled = true;

  // Only process Celestial logs
  if (!message.content.includes("CELESTIAL MOVE")) return;

  // Only process logs in the log channel
  if (message.channel.id !== LOG_CHANNEL) return;

  const content = message.content.replace(/\*\*/g, "");

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

  const now = Date.now();
  const cooldownTime = 5 * 60 * 1000;
  const expiresAt = cooldowns.get(userId);

  if (expiresAt && now < expiresAt) return;

  cooldowns.set(userId, now + cooldownTime);

  const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
  if (!alertChannel) return;

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
      `• **Source:** <#${LOG_CHANNEL}> — [Jump](${message.url})`
    )
    .setTimestamp();

  alertChannel.send({
    content: `<@${PING_USER}>`,
    embeds: [embedAlert]
  });
}
