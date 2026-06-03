// prefix.js
import { simulateRaidAlert } from "./antiRaid.js";
import { simulateNukeAlert } from "./antiNuke.js";
import { boostCommand } from "./boostTracker.js";
import { EmbedBuilder } from "discord.js";

// Bug Report System Imports
import {
  handleDM,
  handleBugButton,
  handleBugStatus
} from "./bug/bugReport.js";

// Suggestion System Imports
import {
  getSuggestionPanel,
  handleSuggestionDM
} from "./suggestions/suggestionSystem.js";

export default async function prefix(msg, client) {
  if (!msg || !msg.content) return;
  if (msg.author.bot) return;

  // Handle DM responses for bug report + suggestion system
  if (msg.channel.type === 1) {
    await handleDM(msg, client);
    await handleSuggestionDM(msg, client);
    return;
  }

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
  if (command === "vouch") return client.vouchSystem.handleVouch(msg, args);
  if (command === "unvouch") return client.vouchSystem.handleUnvouch(msg, args);
  if (command === "vouches") return client.vouchSystem.handleVouches(msg);
  if (command === "leaderboard" || command === "vouchlb" || command === "lb")
    return client.vouchSystem.handleLeaderboard(msg);
  if (command === "cleanvouch")
    return client.vouchSystem.handleCleanVouch(msg, args);

  // Boost stats
  if (command === "boosts") return boostCommand(msg);

  // ============================
  // AATime — FINAL FIXED VERSION
  // ============================
  if (command === "aatime") return handleAATime(msg);

  async function handleAATime(msg) {
    let targetDate = getNextSaturdayAt6PM_ET_asUTC();
    let unix = Math.floor(targetDate.getTime() / 1000); // UTC → UNIX

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
      const now = new Date(); // UTC on Render
      let diff = Math.floor((targetDate - now) / 1000);

      if (diff <= 0) {
        targetDate = getNextSaturdayAt6PM_ET_asUTC();
        unix = Math.floor(targetDate.getTime() / 1000);
        diff = Math.floor((targetDate - now) / 1000);
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      const countdown =
        `${days}D ` +
        `${String(hours).padStart(2, "0")}H ` +
        `${String(minutes).padStart(2, "0")}M ` +
        `${String(seconds).padStart(2, "0")}S remaining till Admin Abuse`;

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

  function getNextSaturdayAt6PM_ET_asUTC() {
    const nowUTC = new Date();
    const nowNY = new Date(
      nowUTC.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    const day = nowNY.getDay();
    let daysUntilSaturday = (6 - day + 7) % 7;

    if (daysUntilSaturday === 0 && nowNY.getHours() >= 18) {
      daysUntilSaturday = 7;
    }

    const targetNY = new Date(
      nowNY.getFullYear(),
      nowNY.getMonth(),
      nowNY.getDate() + daysUntilSaturday,
      18,
      0,
      0,
      0
    );

    const offsetMs = nowUTC.getTime() - nowNY.getTime();
    return new Date(targetNY.getTime() + offsetMs);
  }

  // -----------------------------
  // ADMIN‑ONLY COMMANDS
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

  // BUG PANEL
  if (command === "bugpanel") {
    const { getBugReportPanel } = await import("./bug/bugPanel.js");
    return msg.channel.send(getBugReportPanel());
  }

  //  SUGGESTION PANEL 
  if (command === "suggestpanel") {
    return msg.channel.send(getSuggestionPanel());
  }

 // import banCommand from "./commands/ban.js";
 // import unbanCommand from "./commands/unban.js";

 // if (cmd === "ban") return banCommand(msg, client);
 // if (cmd === "unban") return unbanCommand(msg, client);

 // import mbCommand from "./commands/mb.js";

  if (cmd === "mb") return mbCommand(msg, client);

  // -----------------------------
  // UNKNOWN COMMAND
  // -----------------------------
  return msg.reply(
    "Unknown command. Available: `!afk`, `!vouch`, `!unvouch`, `!vouches`, `!leaderboard`, `!boosts`, `!cooldowns`, `!severity`, `!threshold`, `!sampleraid`, `!samplenuke`, `!aatime`, `!bugpanel`, `!suggestpanel`."
  );
}
