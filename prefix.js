// prefix.js
import { simulateRaidAlert } from "./antiRaid.js";
import { simulateNukeAlert } from "./antiNuke.js";
import { boostCommand } from "./boostTracker.js";
import { EmbedBuilder } from "discord.js";

export default async function prefix(msg, client) {
  if (!msg || !msg.content) return;
  if (msg.author.bot) return;

  // Allow webhook messages ONLY if they are prefix commands
  if (msg.webhookId && !msg.content.startsWith("!")) return;

  const prefix = "!";
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  // -----------------------------
  // PERMISSION CHECK HELPER
  // -----------------------------
  function hasManageServer() {
    return msg.member && msg.member.permissions.has("ManageGuild");
  }

  // -----------------------------
  // PUBLIC COMMANDS (NO PERMS)
  // -----------------------------

  // AFK COMMAND (ONLY RUINED)
  if (command === "afk") {
    if (msg.author.id !== "775991906173452288") {
      return msg.reply("❌ Only the bot owner can use this command.");
    }

    const reason = args.join(" ").trim();
    if (!reason) return msg.reply("❌ You must provide an AFK reason.");

    client.afk.enabled = true;
    client.afk.reason = reason;

    return msg.reply(`🟦 You are now **AFK**.\nReason: **${reason}**`);
  }

  // Vouch system
  if (command === "vouch") {
    return client.vouchSystem.handleVouch(msg, args);
  }

  if (command === "unvouch") {
    return client.vouchSystem.handleUnvouch(msg, args);
  }

  if (command === "vouches") {
    return client.vouchSystem.handleVouches(msg);
  }

  if (command === "leaderboard" || command === "vouchlb" || command === "lb") {
    return client.vouchSystem.handleLeaderboard(msg);
  }

  if (command === "cleanvouch") {
    return client.vouchSystem.handleCleanVouch(msg, args);
  }

  // Boost stats
  if (command === "boosts") {
    return boostCommand(msg);
  }

  // ============================
// AATime — Every Saturday @ 6 PM EST
// ============================
if (command === "aatime") {
  return handleAATime(msg);
}

async function handleAATime(msg) {
  const events = [];

  for (let i = 0; i < 4; i++) {
    const date = getNextSaturdayAt6PM(i);
    const unix = Math.floor(date.getTime() / 1000);

    events.push({
      name: `Saturday Event #${i + 1}`,
      unix,
      countdown: formatCountdown(date)
    });
  }

  const formatted = events
    .map(
      e =>
        `**${e.name}**\n` +
        `Starts: <t:${e.unix}:F>\n` +
        `Discord Countdown: <t:${e.unix}:R>\n` +
        `Custom Countdown: **${e.countdown} remaining till AA**\n`
    )
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("#00aaff")
    .setTitle("📅 Upcoming Saturday Events")
    .setDescription(formatted)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

// Convert next Saturday @ 6 PM EST
function getNextSaturdayAt6PM(offset = 0) {
  const now = new Date();

  const estOffset = now.getTimezoneOffset() + 300; 
  const estNow = new Date(now.getTime() - estOffset * 60000);

  const day = estNow.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;

  const target = new Date(estNow);
  target.setDate(estNow.getDate() + daysUntilSaturday + offset * 7);
  target.setHours(18, 0, 0, 0);

  return new Date(target.getTime() + estOffset * 60000);
}

// Format HH : MM : SS countdown
function formatCountdown(targetDate) {
  const now = new Date();
  let diff = Math.floor((targetDate - now) / 1000);

  if (diff < 0) diff = 0;

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return (
    String(hours).padStart(2, "0") +
    " : " +
    String(minutes).padStart(2, "0") +
    " : " +
    String(seconds).padStart(2, "0")
  );
}


  // -----------------------------
  // ADMIN‑ONLY COMMANDS
  // -----------------------------
  if (!hasManageServer()) {
    return msg.reply("You need **Manage Server** to use this command.");
  }

  // Ping
  if (command === "ping") {
    const sent = await msg.reply("Pinging...");
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    return sent.edit(`Pong! Latency: \`${latency}ms\``);
  }

  // Cooldowns
  if (command === "cooldowns" || command === "cooldown") {
    return client.cooldownSystem.showCooldowns(msg);
  }

  // Severity test
  if (command === "severity") {
    return client.severitySystem.testSeverity(msg, args);
  }

  // Threshold set
  if (command === "threshold") {
    return client.thresholdSystem.setThreshold(msg, args);
  }

  // Anti‑raid test
  if (command === "sampleraid") {
    return simulateRaidAlert(msg, client);
  }

  // Anti‑nuke test
  if (command === "samplenuke") {
    return simulateNukeAlert(msg, client);
  }

  // -----------------------------
  // UNKNOWN COMMAND
  // -----------------------------
  return msg.reply(
    "Unknown command. Available: `!afk`, `!vouch`, `!unvouch`, `!vouches`, `!leaderboard`, `!boosts`, `!cooldowns`, `!severity`, `!threshold`, `!sampleraid`, `!samplenuke`, `!aatime`."
  );
}