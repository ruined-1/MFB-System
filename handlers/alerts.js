// handlers/alerts.js
import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

// Cooldown map
const cooldowns = new Map();

export default function alertHandler(message, client, LOG_CHANNEL) {

  // HARD LOCK: prevent duplicate firing from overlapping instances
  if (message._handledAlert) return;
  message._handledAlert = true;

  // Only process webhook messages in the log channel
  if (message.channel.id !== LOG_CHANNEL) return;
  if (!message.webhookId) return;

  // Remove broken regex — your logs ALWAYS contain "**User:**"
  if (!message.content.includes("**User:**")) return;

  const extract = (label) => {
    const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i");
    const match = message.content.match(regex);
    return match ? match[1].trim() : null;
  };

  const userField = extract("User");
  const brainrotField = extract("Brainrot");
  const amountField = extract("Amount owned");
  const upgradeField = extract("Upgrade");
  const playtimeField = extract("Playtime");
  const cashField = extract("Cash");

  if (!amountField) return;

  const amountOwned = parseInt(amountField.match(/\d+/)?.[0] || "0", 10);
  const threshold = global.dupeThreshold ?? 20;

  if (amountOwned < threshold) return;

  // Extract user ID from "(ID: 123456789)"
  const idMatch = userField.match(/ID:\s*(\d+)/i);
  const userId = idMatch ? idMatch[1] : null;
  if (!userId) return;

  // Cooldown logic
  const now = Date.now();
  const cooldownTime = 5 * 60 * 1000; // 5 minutes
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
