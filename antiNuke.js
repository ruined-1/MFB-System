// antiNuke.js
import { EmbedBuilder } from "discord.js";

const LOG_CHANNEL = "1500667249000841367";

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
    const entry = logs.entries.first();
    if (!entry) return null;
    return entry.executor;
  } catch {
    return null;
  }
}

export async function handleChannelDelete(channel, client) {
  const guild = channel.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 12); // CHANNEL_DELETE
  await sendLog(
    client,
    guild,
    "Channel Deleted",
    `Channel **#${channel.name}** was deleted.`,
    executor
      ? [{ name: "Executor", value: `<@${executor.id}> (${executor.tag})` }]
      : []
  );
}

export async function handleRoleDelete(role, client) {
  const guild = role.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 32); // ROLE_DELETE
  await sendLog(
    client,
    guild,
    "Role Deleted",
    `Role **@${role.name}** was deleted.`,
    executor
      ? [{ name: "Executor", value: `<@${executor.id}> (${executor.tag})` }]
      : []
  );
}

export async function handleGuildBanAdd(ban, client) {
  const guild = ban.guild;
  const user = ban.user;
  if (!guild) return;

  const executor = await getExecutor(guild, 22); // MEMBER_BAN_ADD
  await sendLog(
    client,
    guild,
    "User Banned",
    `User <@${user.id}> (${user.tag}) was banned.`,
    executor
      ? [{ name: "Executor", value: `<@${executor.id}> (${executor.tag})` }]
      : []
  );
}

export async function handleGuildMemberRemove(member, client) {
  const guild = member.guild;
  if (!guild) return;

  // this could be a leave or a kick; we just log it
  const executor = await getExecutor(guild, 20); // MEMBER_KICK
  await sendLog(
    client,
    guild,
    "Member Left or Was Kicked",
    `Member <@${member.id}> (${member.user.tag}) left or was kicked.`,
    executor
      ? [{ name: "Possible Executor", value: `<@${executor.id}> (${executor.tag})` }]
      : []
  );
}

export async function handleWebhookUpdate(channel, client) {
  const guild = channel.guild;
  if (!guild) return;

  const executor = await getExecutor(guild, 50); // WEBHOOK_CREATE/UPDATE (approx)
  await sendLog(
    client,
    guild,
    "Webhook Activity",
    `Webhook activity detected in <#${channel.id}>.`,
    executor
      ? [{ name: "Possible Executor", value: `<@${executor.id}> (${executor.tag})` }]
      : []
  );
}
