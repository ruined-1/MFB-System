// prefix.js
import { simulateRaidAlert } from "./antiRaid.js";
import { simulateNukeAlert } from "./antiNuke.js";
import { boostCommand } from "./boostTracker.js";

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

  // Boost stats
  if (command === "boosts") {
    return boostCommand(msg);
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
    "Unknown command. Available: `!afk`, `!vouch`, `!unvouch`, `!vouches`, `!leaderboard`, `!boosts`, `!cooldowns`, `!severity`, `!threshold`, `!sampleraid`, `!samplenuke`."
  );
}
