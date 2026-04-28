import { EmbedBuilder } from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

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

  if (amountOwned >= (global.dupeThreshold ?? 20)) {
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
        `• **Cash:** ${cashField}\n` +
        `• **Source:** <#${LOG_CHANNEL}> — [Jump](${message.url})`
      )
      .setTimestamp();

    alertChannel.send({
      content: `<@${PING_USER}>`,
      embeds: [embedAlert]
    });
  }
}
