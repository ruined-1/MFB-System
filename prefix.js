export default async function handlePrefix(msg, client) {
  const args = msg.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  if (command === "settings") {
    return msg.reply("Use `/settings` for the settings panel.");
  }

  if (command === "vouch") {
    return msg.reply("Use `/vouch` to record vouches.");
  }

  if (command === "ping") {
    const sent = await msg.reply("Pinging...");
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    return sent.edit(`Pong! Latency: \`${latency}ms\``);
  }

  return msg.reply("Unknown command. Try `/help`.");
}
