export default async function prefix(msg, client) {
  // Ignore bots, webhooks, and empty messages
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
    if (!client.vouchSystem)
      return msg.reply("Vouch system not loaded.");
    return client.vouchSystem.handleVouch(msg, args);
  }

  // !vouches
  if (command === "vouches") {
    if (!client.vouchSystem)
      return msg.reply("Vouch system not loaded.");
    return client.vouchSystem.handleVouches(msg);
  }

  // !leaderboard
  if (command === "leaderboard" || command === "vouchlb") {
    if (!client.vouchSystem)
      return msg.reply("Vouch system not loaded.");
    return client.vouchSystem.handleLeaderboard(msg);
  }

  // !cooldowns
  if (command === "cooldowns" || command === "cooldown") {
    if (!client.cooldownSystem)
      return msg.reply("Cooldown system not loaded.");
    return client.cooldownSystem.showCooldowns(msg);
  }

  // !severity <amount>
  if (command === "severity") {
    if (!client.severitySystem)
      return msg.reply("Severity system not loaded.");
    return client.severitySystem.testSeverity(msg, args);
  }

  // !threshold <value>
  if (command === "threshold") {
    if (!client.thresholdSystem)
      return msg.reply("Threshold system not loaded.");
    return client.thresholdSystem.setThreshold(msg, args);
  }

  // Unknown command
  return msg.reply(
    "Unknown command. Available: `!vouch`, `!vouches`, `!leaderboard`, `!cooldowns`, `!severity`, `!threshold`."
  );
}
