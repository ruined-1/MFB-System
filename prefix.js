export default async function handlePrefix(msg, client) {
  const args = msg.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  // Mirror slash commands
  if (command === "help") {
    return msg.reply("Use `/help` to see all commands.");
  }

  if (command === "cooldown" || command === "cooldowns") {
    return msg.reply("Use `/cooldown` to view or manage cooldowns.");
  }

  if (command === "threshold") {
    return msg.reply("Use `/threshold` to view or set the dupe threshold.");
  }

  if (command === "severity") {
    return msg.reply("Use `/severity` to test severity levels.");
  }

  if (command === "settings") {
    return msg.reply("Use `/settings` to open the settings panel.");
  }

  if (command === "vouch") {
    return msg.reply("Use `/vouch` to record a vouch.");
  }

  if (command === "ping") {
    const sent = await msg.reply("Pinging...");
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    return sent.edit(`Pong! Latency: \`${latency}ms\``);
  }

  return msg.reply("Unknown command. Try `/help`.");
}
