// handlers/alerts.js
import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

const cooldowns = new Map();

// ⭐ Extracts the FIRST number after the label, ignoring all extra text
function extractNumber(label, content) {
  const regex = new RegExp(`${label}[^\\d]*(\\d+)`, "i");
  const match = content.match(regex);
  return match ? parseInt(match[1], 10) : null;
}

// ⭐ Extracts the full line after the label (text only)
function extractText(label, content) {
  const regex = new RegExp(`${label}[^\\n]*`, "i");
  const match = content.match(regex);
  return match ? match[0].replace(label, "").trim() : null;
}

export default function alertHandler(message, client, LOG_CHANNEL) {

  // Prevent double firing
  if (message._mfbAlertHandled) return;
  message._mfbAlertHandled = true;

  // Only process webhook logs
  if (message.channel.id !== LOG_CHANNEL) return;
  if (!message.webhookId) return;

  const content = message.content;

  // ⭐ Extract fields safely (bulletproof)
  const userField = extractText("User", content);
  const brainrotField = extractText("Brainrot", content);
  const amountOwned = extractNumber("Amount owned", content);
  const upgradeField = extractText("Upgrade", content);
  const playtimeField = extractText("Playtime", content);
  const cashField = extractText("Cash", content);

  // If no amount found, ignore
  if (!amountOwned) return;

  const threshold = global.dupeThreshold ?? 20;
  if (amountOwned < threshold) return;

  // Extract user ID from "(ID: 123456789)"
  const idMatch = content.match(/ID:\s*(\d+)/i);
  const userId = idMatch ? idMatch[1] : null;
  if (!userId) return;

  // Cooldown logic
  const now = Date.now();
  const cooldownTime = 5 * 60 * 1000;
  const expiresAt = cooldowns.get(userId);

  if (expiresAt && now < expiresAt) return;

  cooldowns.set(userId, now + cooldownTime);

  const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
  if (!alertChannel) return;

  // Initial embed
  const embedAlert = new EmbedBuilder()
    .setColor("#FFCC00")
    .setTitle("⚠️ Possible dupe detected")
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
  }).then((msg) => {

    let remaining = cooldownTime;

    const interval = setInterval(() => {
      remaining -= 1000;

      if (remaining <= 0) {
        clearInterval(interval);
        return;
      }

      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);

      const updated = EmbedBuilder.from(embedAlert)
        .setDescription(
          `• **User:** ${userField}\n` +
          `• **Brainrot:** ${brainrotField}\n` +
          `• **Amount owned:** ${amountOwned}\n` +
          `• **Upgrade:** ${upgradeField}\n` +
          `• **Playtime:** ${playtimeField}\n` +
          `• **Cash:** ${cashField}\n\n` +
          `⏳ **Cooldown:** ${mins}m ${secs}s\n` +
          `• **Source:** <#${LOG_CHANNEL}> — [Jump](${message.url})`
        );

      msg.edit({
        content: `<@${PING_USER}>`,
        embeds: [updated]
      });

    }, 1000);
  });
}
