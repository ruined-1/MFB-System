import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "775991906173452288";

// ⭐ Cooldown storage
const cooldowns = new Map();

export default function alertHandler(message, client, LOG_CHANNEL) {

  // Only process webhook messages in the log channel
  if (message.channel.id !== LOG_CHANNEL) return;
  if (!message.webhookId) return;

  // Ignore echo/system messages
  if (!message.content.includes("User:")) return;

  const extract = (label) => {
    const regex = new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i");
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

  // ⭐ Extract numeric user ID from "User: Username (123456789)"
  const userIdMatch = userField?.match(/\((\d+)\)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return;

  // ⭐ Cooldown check
  const now = Date.now();
  const cooldownTime = 5 * 60 * 1000; // 5 minutes
  const expiresAt = cooldowns.get(userId);

  if (expiresAt && now < expiresAt) {
    // Still on cooldown → do NOT alert again
    return;
  }

  // ⭐ Set new cooldown
  cooldowns.set(userId, now + cooldownTime);

  // ⭐ Build real-time cooldown text
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
