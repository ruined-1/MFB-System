export default async function handlePrefix(msg, client) {
  // Ignore bots, webhooks, system messages
  if (!msg || !msg.content) return;
  if (msg.author.bot) return;
  if (msg.webhookId) return;

  const prefix = "!";
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  // -----------------------------
  // PREFIX COMMANDS
  // -----------------------------

  // !ping
  if (command === "ping") {
    const sent = await msg.reply("Pinging...");
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    return sent.edit(`Pong! Latency: \`${latency}ms\``);
  }

  // !vouch <user> <reason>
  if (command === "vouch") {
    return client.vouchSystem.handleVouch(msg, args);
  }

  // !vouches (view your vouches)
  if (command === "vouches") {
    return client.vouchSystem.handleVouches(msg);
  }

  // !leaderboard
  if (command === "leaderboard" || command === "vouchlb") {
    return client.vouchSystem.handleLeaderboard(msg);
  }

  // !cooldowns
  if (command === "cooldowns" || command === "cooldown") {
    return client.cooldownSystem.showCooldowns(msg);
  }

  // !severity <amount>
  if (command === "severity") {
    return client.severitySystem.testSeverity(msg, args);
  }

  // !threshold <value>
  if (command === "threshold") {
    return client.thresholdSystem.setThreshold(msg, args);
  }

  // Unknown command
  return msg.reply("Unknown command. Available commands: `!vouch`, `!vouches`, `!leaderboard`, `!cooldowns`, `!severity`, `!threshold`.");
}
