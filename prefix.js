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

  if (command === "aatime") {
    return handleAATime(msg);
  }


// -----------------------------
// AA Countdown Command
// -----------------------------
  async function handleAATime(msg) {
  let targetDate = getNextSaturdayAt6PM();
  let unix = Math.floor(targetDate.getTime() / 1000);

  const embed = new EmbedBuilder()
    .setColor("#00aaff")
    .setTitle("⏳ AA Countdown")
    .setDescription(
      `Starts: <t:${unix}:F>\n` +
      `Discord Countdown: <t:${unix}:R>\n` +
      `Custom Countdown: **calculating...**`
    )
    .setTimestamp();

  const sent = await msg.reply({ embeds: [embed] });

  const interval = setInterval(async () => {
    const now = new Date();

    let diff = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

    if (diff <= 0) {
      targetDate = getNextSaturdayAt6PM();
      unix = Math.floor(targetDate.getTime() / 1000);

      diff = Math.floor(
        (targetDate.getTime() - now.getTime()) / 1000
      );
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    const countdown =
      `${String(days).padStart(2, "0")}d ` +
      `${String(hours).padStart(2, "0")}h ` +
      `${String(minutes).padStart(2, "0")}m ` +
      `${String(seconds).padStart(2, "0")}s remaining till AA`;

    const updated = new EmbedBuilder()
      .setColor("#00aaff")
      .setTitle("⏳ AA Countdown")
      .setDescription(
        `Starts: <t:${unix}:F>\n` +
        `Discord Countdown: <t:${unix}:R>\n` +
        `Custom Countdown: **${countdown}**`
      )
      .setTimestamp();

    try {
      await sent.edit({ embeds: [updated] });
    } catch {
      clearInterval(interval);
    }
  }, 1000);
}


function getNextSaturdayAt6PM() {
  const now = new Date();

  const day = now.getDay(); // 0 = Sun, 6 = Sat
  let daysUntilSaturday = (6 - day + 7) % 7;

  // If it's Saturday and it's already past 6 PM → next week
  if (daysUntilSaturday === 0 && now.getHours() >= 18) {
    daysUntilSaturday = 7;
  }

  // Build the target date in LOCAL TIME
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSaturday,
    18, // 6 PM local
    0,
    0,
    0
  );
  
  return target;
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