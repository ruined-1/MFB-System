console.log("PREFIX HANDLER VERSION 3002");

const vouches = new Map();
const cooldowns = new Map();
let cooldownDuration = 10;

export default function prefixHandler(message, client) {
  if (!message || !message.content) return;
  if (message._mfbPrefixHandled) return;
  message._mfbPrefixHandled = true;

  if (message.author?.bot) return;
  if (message.webhookId) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  console.log("COMMAND PARSED:", cmd);

  // ⭐ TESTCMD RESTORED
  if (cmd === "testcmd") {
    return message.channel.send("Test command fired.");
  }

  if (cmd === "ping") {
    return message.channel.send("Pong!");
  }

  if (cmd === "vouch") {
    const target = message.mentions.users.first();

    if (!target)
      return message.channel.send("You must mention someone to vouch for.");

    if (target.id === message.author.id)
      return message.channel.send("You cannot vouch for yourself.");

    const now = Date.now();
    const last = cooldowns.get(message.author.id) || 0;
    const diff = (now - last) / 1000;

    if (diff < cooldownDuration) {
      const remaining = Math.ceil(cooldownDuration - diff);
      return message.channel.send(`You must wait **${remaining}s** before vouching again.`);
    }

    const current = vouches.get(target.id) || 0;
    vouches.set(target.id, current + 1);

    cooldowns.set(message.author.id, now);

    return message.channel.send(`You vouched for **${target.username}**!`);
  }

  if (cmd === "vouches") {
    const target = message.mentions.users.first() || message.author;
    const count = vouches.get(target.id) || 0;

    return message.channel.send(`**${target.username}** has **${count}** vouches.`);
  }

  if (cmd === "leaderboard") {
    if (vouches.size === 0)
      return message.channel.send("No vouches yet.");

    const sorted = [...vouches.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const text = sorted
      .map(([id, count], i) => `**${i + 1}.** <@${id}> — **${count}** vouches`)
      .join("\n");

    return message.channel.send(`🏆 **Vouch Leaderboard**\n${text}`);
  }

  if (cmd === "setcooldown") {
    const sec = parseInt(args[0]);
    if (isNaN(sec) || sec < 0)
      return message.channel.send("Invalid cooldown time.");

    cooldownDuration = sec;
    return message.channel.send(`Cooldown set to **${sec} seconds**.`);
  }

  if (cmd === "cooldown") {
    return message.channel.send(`Current cooldown: **${cooldownDuration} seconds**.`);
  }

  if (cmd === "resetcooldown") {
    const target = message.mentions.users.first();
    if (!target)
      return message.channel.send("Mention a user to reset their cooldown.");

    cooldowns.delete(target.id);
    return message.channel.send(`Cooldown reset for **${target.username}**.`);
  }

  if (cmd === "cooldowns") {
    if (cooldowns.size === 0)
      return message.channel.send("No active cooldowns.");

    const now = Date.now();
    const text = [...cooldowns.entries()]
      .map(([id, ts]) => {
        const diff = Math.ceil(cooldownDuration - (now - ts) / 1000);
        return `<@${id}> — ${diff > 0 ? diff : 0}s remaining`;
      })
      .join("\n");

    return message.channel.send(`⏳ **Active Cooldowns:**\n${text}`);
  }
}
