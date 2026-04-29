import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

// Cooldown map
const cooldowns = new Map();

export default function alertHandler(message, client, LOG_CHANNEL) {

  // Only process webhook messages in the log channel
  if (message.channel.id !== LOG_CHANNEL) return;
  if (!message.webhookId) return;

  // Detect real celestial logs (markdown-safe)
  if (!/\*\*?User\*\*?:/i.test(message.content)) return;

  const extract = (label) => {
    const regex = new RegExp(`\\*\\*?${label}\\*\\*?:\\s*([^\\n]+)`, "i");
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

  const minutes = Math.floor(cooldownTime / 60000);
  const seconds = Math.floor((cooldownTime % 60000) / 1000);

  const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);

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
      `⏳ **Cooldown:** ${minutes}m ${seconds}s\n` +
      `• **Source:** <#${LOG_CHANNEL}> — [Jump](${message.url})`
    )
    .setTimestamp();

  alertChannel.send({
    content: `<@${PING_USER}>`,
    embeds: [embedAlert]
  });
}
