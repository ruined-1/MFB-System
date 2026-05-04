// antiRaid.js
import { EmbedBuilder } from "discord.js";

const LOG_CHANNEL = "1500667249000841367";

// thresholds (soft, just for logging)
const JOIN_WINDOW_MS = 10_000;
const JOIN_THRESHOLD = 5;

const MSG_WINDOW_MS = 5_000;
const MSG_THRESHOLD = 10;

const PING_WINDOW_MS = 5_000;
const PING_THRESHOLD = 5;

// in-memory tracking
const recentJoins = [];
const userMessages = new Map();
const userPings = new Map();

function pruneOld(list, windowMs) {
  const cutoff = Date.now() - windowMs;
  while (list.length && list[0] < cutoff) list.shift();
}

function pruneMap(map, windowMs) {
  const cutoff = Date.now() - windowMs;
  for (const [id, arr] of map.entries()) {
    const filtered = arr.filter((t) => t >= cutoff);
    if (filtered.length === 0) map.delete(id);
    else map.set(id, filtered);
  }
}

async function logRaidEvent(guild, client, title, description, fields = []) {
  const channel = client.channels.cache.get(LOG_CHANNEL);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#ffcc00")
    .setTitle(`🛡️ Anti-Raid: ${title}`)
    .setDescription(description)
    .addFields(...fields)
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

// called from guildMemberAdd
export async function handleJoin(member, client) {
  if (!member.guild) return;

  recentJoins.push(Date.now());
  pruneOld(recentJoins, JOIN_WINDOW_MS);

  if (recentJoins.length >= JOIN_THRESHOLD) {
    await logRaidEvent(
      member.guild,
      client,
      "Join Spike Detected",
      `Detected **${recentJoins.length}** joins in the last **${JOIN_WINDOW_MS / 1000}s**.`,
      [
        {
          name: "Most Recent Join",
          value: `<@${member.id}> (${member.user.tag})`,
        },
      ]
    );
  }
}

// called from messageCreate
export async function handleMessage(msg, client) {
  if (!msg.guild) return;
  if (msg.author.bot) return;

  const now = Date.now();
  const userId = msg.author.id;

  // track messages per user
  if (!userMessages.has(userId)) userMessages.set(userId, []);
  userMessages.get(userId).push(now);
  pruneMap(userMessages, MSG_WINDOW_MS);

  const msgCount = userMessages.get(userId)?.length || 0;
  if (msgCount >= MSG_THRESHOLD) {
    await logRaidEvent(
      msg.guild,
      client,
      "Message Spam Detected",
      `User <@${userId}> (${msg.author.tag}) sent **${msgCount}** messages in **${MSG_WINDOW_MS / 1000}s**.`,
      [
        {
          name: "Channel",
          value: `<#${msg.channel.id}>`,
        },
      ]
    );
  }

  // track pings per user
  const mentionCount = msg.mentions.users.size + msg.mentions.roles.size + (msg.mentions.everyone ? 1 : 0);
  if (mentionCount > 0) {
    if (!userPings.has(userId)) userPings.set(userId, []);
    userPings.get(userId).push(now);
    pruneMap(userPings, PING_WINDOW_MS);

    const pingCount = userPings.get(userId)?.length || 0;
    if (pingCount >= PING_THRESHOLD) {
      await logRaidEvent(
        msg.guild,
        client,
        "Ping Spam Detected",
        `User <@${userId}> (${msg.author.tag}) triggered **${pingCount}** ping-heavy messages in **${PING_WINDOW_MS / 1000}s**.`,
        [
          {
            name: "Channel",
            value: `<#${msg.channel.id}>`,
          },
        ]
      );
    }
  }
}
