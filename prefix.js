import { simulateRaidAlert } from "./antiRaid.js";
import { simulateNukeAlert } from "./antiNuke.js";

export default async function prefix(msg, client) {
  if (!msg || !msg.content) return;
  if (msg.author.bot) return;

  if (msg.webhookId && !msg.content.startsWith("!")) return;

  const prefix = "!";
  if (!msg.content.startsWith(prefix)) return;

  // PERMISSION CHECK
  if (!msg.member.permissions.has("ManageGuild")) {
    return msg.reply("You need **Manage Server** to use bot commands.");
  }

  const args = msg.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  // TEST COMMANDS
  if (command === "sampleraid") return simulateRaidAlert(msg, client);
  if (command === "samplenuke") return simulateNukeAlert(msg, client);

  // EXISTING COMMANDS...
  if (command === "ping") {
    const sent = await msg.reply("Pinging...");
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    return sent.edit(`Pong! Latency: \`${latency}ms\``);
  }

  if (command === "vouch") return client.vouchSystem.handleVouch(msg, args);
  if (command === "unvouch") return client.vouchSystem.handleUnvouch(msg, args);
  if (command === "vouches") return client.vouchSystem.handleVouches(msg);
  if (command === "leaderboard" || command === "vouchlb")
    return client.vouchSystem.handleLeaderboard(msg);

  if (command === "cooldowns" || command === "cooldown")
    return client.cooldownSystem.showCooldowns(msg);

  if (command === "severity")
    return client.severitySystem.testSeverity(msg, args);

  if (command === "threshold")
    return client.thresholdSystem.setThreshold(msg, args);

  return msg.reply(
    "Unknown command. Available: `!vouch`, `!unvouch`, `!vouches`, `!leaderboard`, `!cooldowns`, `!severity`, `!threshold`, `!sampleraid`, `!samplenuke`."
  );
}
