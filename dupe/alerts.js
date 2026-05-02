import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";

import {
  isOnCooldown,
  setCooldownEnd
} from "./cooldowns.js";

import {
  getSeverityColor,
  getSeverityLabel
} from "./severity.js";

const ALERT_CHANNEL_ID = "1496324911084470473";
const NORMAL_PING = "967946056572747776";
const ESCALATION_PING = "750441339195490335";

const recentRequests = new Map();

export default async function alertHandler(msg, client) {
  try {
    console.log("ALERT HANDLER TRIGGERED:", {
      webhookId: msg.webhookId,
      channel: msg.channel.id,
      content: msg.content
    });

    if (!msg.webhookId) return;

    const content = msg.content;

    // ============================================================
    //  TYPE A: FULL CELESTIAL LOGS (Amount Owned, Upgrade, Cash…)
    // ============================================================

    const fullUser = content.match(/User:\s*(.+?)\s*\(ID:/i);
    const fullId = content.match(/ID:\s*(\d+)/i);
    const fullBrainrot = content.match(/Brainrot:\s*(.+)/i);
    const fullAmount = content.match(/Amount owned:\s*(\d+)/i);
    const fullUpgrade = content.match(/Upgrade:\s*(\d+)/i);
    const fullPlaytime = content.match(/Playtime:\s*(.+)/i);
    const fullCash = content.match(/Cash:\s*(.+)/i);

    const isFullLog =
      fullUser &&
      fullId &&
      fullBrainrot &&
      fullAmount &&
      fullUpgrade &&
      fullPlaytime &&
      fullCash;

    if (isFullLog) {
      console.log("Detected FULL dupe log");

      const playerId = fullId[1];
      const username = fullUser[1];
      const brainrot = fullBrainrot[1];
      const amountOwned = parseInt(fullAmount[1]);
      const upgrade = fullUpgrade[1];
      const playtime = fullPlaytime[1];
      const cash = fullCash[1];

      if (amountOwned < 20) {
        console.log("SKIPPED: Below threshold");
        return;
      }

      const requestId = `FULL-${playerId}-${brainrot}-${amountOwned}-${upgrade}-${playtime}-${cash}`;
      const now = Date.now();

      if (recentRequests.has(requestId) && now - recentRequests.get(requestId) < 10000) {
        console.log("SKIPPED: Duplicate FULL log");
        return;
      }
      recentRequests.set(requestId, now);

      const severity = getSeverityLabel(amountOwned);
      const color = getSeverityColor(amountOwned);

      let cooldownSeconds = 0;
      if (severity === "YELLOW") cooldownSeconds = 240;
      else if (severity === "ORANGE") cooldownSeconds = 120;
      else if (severity === "RED") cooldownSeconds = 30;

      if (isOnCooldown(playerId)) {
        console.log("SKIPPED: Player on cooldown");
        return;
      }

      const cooldownEnd = Date.now() + cooldownSeconds * 1000;
      const cooldownUnix = Math.floor(cooldownEnd / 1000);
      setCooldownEnd(playerId, cooldownEnd);

      const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle(`🚨 Possible Dupe Detected — ${severity} severity`)
        .setColor(color)
        .addFields(
          { name: "User", value: `${username} (ID: ${playerId})` },
          { name: "Brainrot", value: brainrot, inline: true },
          { name: "Amount Owned", value: amountOwned.toString(), inline: true },
          { name: "Upgrade", value: upgrade.toString(), inline: true },
          { name: "Playtime", value: playtime },
          { name: "Cash", value: cash },
          { name: "Cooldown", value: `<t:${cooldownUnix}:R>` }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`reset_${playerId}`)
          .setLabel("Reset Cooldown")
          .setStyle(ButtonStyle.Danger)
      );

      let pingString = `<@${NORMAL_PING}>`;
      if (severity === "RED") pingString += ` <@${ESCALATION_PING}>`;

      await channel.send({
        content: pingString,
        embeds: [embed],
        components: [row]
      });

      console.log("FULL ALERT SENT");
      return;
    }

    // ============================================================
    //  TYPE B: SUSPICIOUS LOGS (Failed inventory lock)
    // ============================================================

    const suspiciousMatch = content.match(/SUSPICIOUS:\s*(.+?)\s+failed inventory lock\s+(\d+)\s+times/i);

    if (suspiciousMatch) {
      console.log("Detected SUSPICIOUS log");

      const username = suspiciousMatch[1];
      const fails = parseInt(suspiciousMatch[2]);

      // No player ID in this log → use username as ID
      const playerId = `SUS-${username.toLowerCase()}`;

      const requestId = `SUS-${username}-${fails}`;
      const now = Date.now();

      if (recentRequests.has(requestId) && now - recentRequests.get(requestId) < 10000) {
        console.log("SKIPPED: Duplicate SUSPICIOUS log");
        return;
      }
      recentRequests.set(requestId, now);

      // Severity for suspicious logs
      let severity = "YELLOW";
      if (fails >= 10) severity = "ORANGE";
      if (fails >= 20) severity = "RED";

      const color =
        severity === "RED" ? 0xff0000 :
        severity === "ORANGE" ? 0xffa500 :
        0xffff00;

      let cooldownSeconds = 60; // shorter cooldown for suspicious logs
      if (severity === "ORANGE") cooldownSeconds = 120;
      if (severity === "RED") cooldownSeconds = 180;

      if (isOnCooldown(playerId)) {
        console.log("SKIPPED: Suspicious player on cooldown");
        return;
      }

      const cooldownEnd = Date.now() + cooldownSeconds * 1000;
      const cooldownUnix = Math.floor(cooldownEnd / 1000);
      setCooldownEnd(playerId, cooldownEnd);

      const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Suspicious Activity — ${severity} severity`)
        .setColor(color)
        .addFields(
          { name: "User", value: username },
          { name: "Failed Inventory Locks", value: fails.toString(), inline: true },
          { name: "Cooldown", value: `<t:${cooldownUnix}:R>` }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`reset_${playerId}`)
          .setLabel("Reset Cooldown")
          .setStyle(ButtonStyle.Danger)
      );

      let pingString = `<@${NORMAL_PING}>`;
      if (severity === "RED") pingString += ` <@${ESCALATION_PING}>`;

      await channel.send({
        content: pingString,
        embeds: [embed],
        components: [row]
      });

      console.log("SUSPICIOUS ALERT SENT");
      return;
    }

    console.log("SKIPPED: No known log format detected");

  } catch (err) {
    console.error("Error in alertHandler:", err);
  }
}
