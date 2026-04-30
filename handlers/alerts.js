// handlers/alerts.js
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";
const ESCALATION_PING = "750441339195490335";

const handledMessages = new WeakSet();
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

// Severity logic
function determineSeverity(amountOwned, playtimeField, cashField, upgradeField, brainrotField) {
  let severity = "YELLOW";

  if (amountOwned >= 100) severity = "RED";
  else if (amountOwned >= 50) severity = "ORANGE";
  else if (amountOwned >= 20) severity = "YELLOW";

  const playtimeLow = /0h/i.test(playtimeField);
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

  if (handledMessages.has(message)) return;
  handledMessages.add(message);

  if (!message.channel || message.channel.id !== logChannelId) return;

  let content = message.content?.trim();

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

  // ⭐ Severity-based cooldown durations
  const severity = determineSeverity(amountOwned, playtimeField, cashField, upgradeField, brainrotField);

  let cooldownTime = 5 * 60 * 1000; // YELLOW default
  if (severity === "ORANGE") cooldownTime = 2 * 60 * 1000;
  if (severity === "RED") cooldownTime = 10 * 1000;

  const now = Date.now();
  const expiresAt = cooldowns.get(userId);

  if (expiresAt && now < expiresAt) return;

  const cooldownEnd = now + cooldownTime;
  cooldowns.set(userId, cooldownEnd);

  const severityColors = {
    YELLOW: "#FFD93D",
    ORANGE: "#FF8C42",
    RED: "#FF3B30"
  };

  const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);
  if (!alertChannel) return;

  const cooldownTimestamp = `<t:${Math.floor(cooldownEnd / 1000)}:R>`;

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
  `⏳ **Cooldown ends:** ${cooldownTimestamp}\n` +
  `• **Source:** <#${logChannelId}> — [Jump to message](${message.url})`
)

    .setTimestamp();

  // ⭐ Reset cooldown button
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`resetCooldown_${userId}`)
      .setLabel("Reset Cooldown")
      .setStyle(ButtonStyle.Danger)
  );

  const pingString =
    severity === "RED"
      ? `<@${PING_USER}> <@${ESCALATION_PING}>`
      : `<@${PING_USER}>`;

  await alertChannel.send({
    content: pingString,
    embeds: [embedAlert],
    components: [row]
  });
}
export { cooldowns };
