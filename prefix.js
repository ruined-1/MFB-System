// prefix.js
import { simulateRaidAlert } from "./antiRaid.js";
import { simulateNukeAlert } from "./antiNuke.js";
import { boostCommand } from "./boostTracker.js";
import { EmbedBuilder } from "discord.js";

export default async function prefix(msg, client) {
  if (!msg || !msg.content) return;
  if (msg.author.bot) return;

  if (msg.webhookId && !msg.content.startsWith("!")) return;

  const prefix = "!";
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  function hasManageServer() {
    return msg.member && msg.member.permissions.has("ManageGuild");
  }

  // -----------------------------
  // PUBLIC COMMANDS
  // -----------------------------

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

  if (command === "vouch") return client.vouchSystem.handleVouch(msg, args);
  if (command === "unvouch") return client.vouchSystem.handleUnvouch(msg, args);
  if (command === "vouches") return client.vouchSystem.handleVouches(msg);
  if (command === "leaderboard" || command === "vouchlb" || command === "lb")
    return client.vouchSystem.handleLeaderboard(msg);
  if (command === "cleanvouch")
    return client.vouchSystem.handleCleanVouch(msg, args);

  if (command === "boosts") return boostCommand(msg);

  // ============================
  // BRAND NEW AA SYSTEM
  // ============================
  if (command === "aatime") return handleAATime(msg);

  async function handleAATime(msg) {
    let targetDate = getNextSaturdayAt6PM();

    // ⭐ UNIX timestamp based on LOCAL TIME
    let unix = Math.floor(targetDate.getTime() / 1000);

    const embed = new EmbedBuilder()
      .setColor("#00aaff")
      .setTitle("⏳ Admin Abuse Countdown")
      .setDescription(
        `Starts: <t:${unix}:F>\n` +
        `Discord Countdown: <t:${unix}:R>\n` +
        `Custom Countdown: **calculating...**`
      )
      .setTimestamp();

    const sent = await msg.reply({ embeds: [embed] });

    const interval = setInterval(async () => {
      const now = new Date();
      let diff = Math.floor((targetDate - now) / 1000);

      if (diff <= 0) {
        targetDate = getNextSaturdayAt6PM();
        unix = Math.floor(targetDate.getTime() / 1000);
        diff = Math.floor((targetDate - now) / 1000);
      }

      const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const seconds = String(diff % 60).padStart(2, "0");

      const countdown = `${hours}h ${minutes}m ${seconds}s remaining till Admin Abuse`;

      const updated = new EmbedBuilder()
        .setColor("#00aaff")
        .setTitle("⏳ Admin Abuse Countdown")
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

  // ============================
  // CLEAN LOCAL-TIME DATE LOGIC
  // ============================
  function getNextSaturdayAt6PM() {
  // Step 1: Get current time in America/New_York
  const nowNY = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = nowNY.getDay(); // 0 = Sun, 6 = Sat
  let daysUntilSaturday = (6 - day + 7) % 7;

  // If it's Saturday and past 6 PM → next week
  if (daysUntilSaturday === 0 && nowNY.getHours() >= 18) {
    daysUntilSaturday = 7;
  }

  // Step 2: Build the target date in NY local time
  const targetNY = new Date(
    nowNY.getFullYear(),
    nowNY.getMonth(),
    nowNY.getDate() + daysUntilSaturday,
    18, // 6 PM Eastern
    0,
    0,
    0
  );

  // Step 3: Convert NY time → UTC Date object
  const targetUTC = new Date(
    Date.UTC(
      targetNY.getFullYear(),
      targetNY.getMonth(),
      targetNY.getDate(),
      targetNY.getHours(),
      targetNY.getMinutes(),
      targetNY.getSeconds()
    )
  );

  return targetUTC;
}


  // -----------------------------
  // ADMIN COMMANDS
  // -----------------------------
  if (!hasManageServer()) {
    return msg.reply("You need **Manage Server** to use this command.");
  }

  if (command === "ping") {
    const sent = await msg.reply("Pinging...");
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    return sent.edit(`Pong! Latency: \`${latency}ms\``);
  }

  if (command === "cooldowns" || command === "cooldown")
    return client.cooldownSystem.showCooldowns(msg);

  if (command === "severity")
    return client.severitySystem.testSeverity(msg, args);

  if (command === "threshold")
    return client.thresholdSystem.setThreshold(msg, args);

  if (command === "sampleraid")
    return simulateRaidAlert(msg, client);

  if (command === "samplenuke")
    return simulateNukeAlert(msg, client);

  return msg.reply(
    "Unknown command. Available: `!afk`, `!vouch`, `!unvouch`, `!vouches`, `!leaderboard`, `!boosts`, `!cooldowns`, `!severity`, `!threshold`, `!sampleraid`, `!samplenuke`, `!aatime`."
  );
}
