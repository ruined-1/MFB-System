// antiNuke.js
import pkg from "discord.js";
const { EmbedBuilder } = pkg;


const LOG_CHANNEL = "1520634264662577325";

async function sendLog(client, guild, title, description, fields = [], color = "#ff4444") {
  const channel = client.channels.cache.get(LOG_CHANNEL);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`🚨 Anti-Nuke: ${title}`)
    .setDescription(description)
    .addFields(...fields)
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

async function getExecutor(guild, type) {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 1 });
    return logs.entries.first()?.executor || null;
  } catch {
    return null;
  }
}

export async function handleChannelDelete(channel, client) {
  const guild = channel.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 12);
  await sendLog(
    client,
    guild,
    "Channel Deleted",
    `Channel **#${channel.name}** was deleted.`,
    executor ? [{ name: "Executor", value: `<@${executor.id}> (${executor.tag})` }] : []
  );
}

export async function handleRoleDelete(role, client) {
  const guild = role.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 32);
  await sendLog(
    client,
    guild,
    "Role Deleted",
    `Role **@${role.name}** was deleted.`,
    executor ? [{ name: "Executor", value: `<@${executor.id}> (${executor.tag})` }] : []
  );
}

export async function handleGuildBanAdd(ban, client) {
  const guild = ban.guild;
  const user = ban.user;

  const executor = await getExecutor(guild, 22);
  await sendLog(
    client,
    guild,
    "User Banned",
    `User <@${user.id}> (${user.tag}) was banned.`,
    executor ? [{ name: "Executor", value: `<@${executor.id}> (${executor.tag})` }] : []
  );
}

export async function handleGuildMemberRemove(member, client) {
  const guild = member.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 20);
  await sendLog(
    client,
    guild,
    "Member Left or Was Kicked",
    `Member <@${member.id}> (${member.user.tag}) left or was kicked.`,
    executor ? [{ name: "Possible Executor", value: `<@${executor.id}> (${executor.tag})` }] : []
  );
}

export async function handleWebhookUpdate(channel, client) {
  const guild = channel.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 50);
  await sendLog(
    client,
    guild,
    "Webhook Activity",
    `Webhook activity detected in <#${channel.id}>.`,
    executor ? [{ name: "Possible Executor", value: `<@${executor.id}> (${executor.tag})` }] : []
  );
}

// SAMPLE NUKE ALERT
export async function simulateNukeAlert(msg, client) {
  const LOG_CHANNEL = "1520634264662577325";
  const TARGET_USER = "1145855495974965429";

  const channel = client.channels.cache.get(LOG_CHANNEL);
  if (!channel) return msg.reply("Log channel not found.");

  // ============================
  // BURST PING MODE (58 pings)
  // ============================
  const burstMessages = [];
  for (let i = 1; i <= 58; i++) {
    burstMessages.push(`<@${TARGET_USER}> 🚨 Nuke Ping #${i}`);
  }

  burstMessages.forEach(m => channel.send(m));

  // ============================
  // OPTIONAL: 35 NUKE ALERT EMBEDS
  // ============================
  for (let i = 1; i <= 35; i++) {
    const embed = new EmbedBuilder()
      .setColor("#ff4444")
      .setTitle(`🚨 Anti-Nuke: Sample Nuke Alert #${i}`)
      .setDescription("This is a **simulated nuke alert** triggered manually.")
      .addFields({ name: "Example", value: "Channel delete / role delete / mass kick" })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }

  return msg.reply("⚡ Burst nuke simulation complete — 58 pings + 35 alerts fired.");
}
