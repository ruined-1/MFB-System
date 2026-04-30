console.log("PREFIX HANDLER VERSION 999");
console.log("prefix handler loaded");

// In‑memory storage
const vouches = new Map();        // userId → number
const cooldowns = new Map();      // userId → timestamp
let cooldownDuration = 10;        // default 10 seconds

export default async function prefixHandler(message, client) {
  // Log everything
  console.log("RAW MSG:", {
    id: message.id,
    content: message.content,
    authorId: message.author?.id,
    authorBot: message.author?.bot,
    webhookId: message.webhookId,
    channelId: message.channelId,
  });

  // Ignore bots + webhooks
  if (message.author?.bot) return;
  if (message.webhookId) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  // -----------------------------
  // ⭐ COMMAND: !vouch @user
  // -----------------------------
  if (cmd === "vouch") {
    const target = message.mentions.users.first();
    if (!target) return message.reply("You must mention someone to vouch for.");

    if (target.id === message.author.id)
      return message.reply("You cannot vouch for yourself.");

    // Cooldown check
    const now = Date.now();
    const last = cooldowns.get(message.author.id) || 0;
    const diff = (now - last) / 1000;

    if (diff < cooldownDuration) {
      const remaining = Math.ceil(cooldownDuration - diff);
      return message.reply(`You must wait **${remaining}s** before vouching again.`);
    }

    // Apply vouch
    const current = vouches.get(target.id) || 0;
    vouches.set(target.id, current + 1);

    // Apply cooldown
    cooldowns.set(message.author.id, now);

    return message.reply(`You vouched for **${target.username}**!`);
  }

  // -----------------------------
  // ⭐ COMMAND: !vouches @user
  // -----------------------------
  if (cmd === "vouches") {
    const target = message.mentions.users.first() || message.author;
    const count = vouches.get(target.id) || 0;
    return message.reply(`**${target.username}** has **${count}** vouches.`);
  }

  // -----------------------------
  // ⭐ COMMAND: !leaderboard
  // -----------------------------
  if (cmd === "leaderboard") {
    if (vouches.size === 0) return message.reply("No vouches yet.");

    const sorted = [...vouches.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const text = sorted
      .map(([id, count], i) => `**${i + 1}.** <@${id}> — **${count}** vouches`)
      .join("\n");

    return message.reply(`🏆 **Vouch Leaderboard**\n${text}`);
  }

  // -----------------------------
  // ⭐ COMMAND: !setcooldown <seconds>
  // -----------------------------
  if (cmd === "setcooldown") {
    const sec = parseInt(args[0]);
    if (isNaN(sec) || sec < 0) return message.reply("Invalid cooldown time.");

    cooldownDuration = sec;
    return message.reply(`Cooldown set to **${sec} seconds**.`);
  }

  // -----------------------------
  // ⭐ COMMAND: !cooldown
  // -----------------------------
  if (cmd === "cooldown") {
    return message.reply(`Current cooldown: **${cooldownDuration} seconds**.`);
  }

  // -----------------------------
  // ⭐ COMMAND: !resetcooldown @user
  // -----------------------------
  if (cmd === "resetcooldown") {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Mention a user to reset their cooldown.");

    cooldowns.delete(target.id);
    return message.reply(`Cooldown reset for **${target.username}**.`);
  }

  // -----------------------------
  // ⭐ COMMAND: !cooldowns
  // -----------------------------
  if (cmd === "cooldowns") {
    if (cooldowns.size === 0) return message.reply("No active cooldowns.");

    const now = Date.now();
    const text = [...cooldowns.entries()]
      .map(([id, ts]) => {
        const diff = Math.ceil(cooldownDuration - (now - ts) / 1000);
        return `<@${id}> — ${diff > 0 ? diff : 0}s remaining`;
      })
      .join("\n");

    return message.reply(`⏳ **Active Cooldowns:**\n${text}`);
  }

  // -----------------------------
  // ⭐ COMMAND: !ping
  // -----------------------------
  if (cmd === "ping") {
    return message.reply("Pong!");
  }
}
