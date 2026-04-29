import { EmbedBuilder } from "discord.js";
import { vouches } from "../vouches.js";
import { saveVouches } from "../saveVouches.js";

export default function prefixHandler(message, client) {

  // Ignore bot messages
  if (message.author.id === client.user.id) return;

  // Ignore webhook messages
  if (message.webhookId) return;

  // Ignore empty/system messages (prevents prefix doubling)
  if (!message.content || message.content.trim() === "") return;

  // Only prefix commands
  if (!message.content.startsWith("!")) return;

  const args = message.content.trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "!setthreshold") {
    const value = parseInt(args[0], 10);
    if (isNaN(value) || value < 1)
      return message.reply("Please provide a valid number greater than 0.");

    global.dupeThreshold = value;
    return message.reply(`Dupe alert threshold updated to **${value}**.`);
  }

  if (cmd === "!vouch") {
    const target = message.mentions.users.first();
    if (!target) return message.reply("You must mention someone to vouch.");
    if (target.id === message.author.id)
      return message.reply("You cannot vouch yourself.");

    vouches[target.id] = (vouches[target.id] ?? 0) + 1;
    saveVouches(vouches);

    return message.reply(
      `You vouched for **${target.tag}**. They now have **${vouches[target.id]}** vouches.`
    );
  }

  if (cmd === "!vouches") {
    const target = message.mentions.users.first() || message.author;
    const count = vouches[target.id] ?? 0;

    const embed = new EmbedBuilder()
      .setColor("#00AEEF")
      .setTitle(`${target.username}'s Vouch Profile`)
      .setThumbnail(target.displayAvatarURL({ size: 1024 }))
      .addFields(
        { name: "Total Vouches", value: `${count}`, inline: true },
        { name: "User ID", value: target.id, inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (cmd === "!leaderboard") {
    const sorted = Object.entries(vouches)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sorted.length === 0)
      return message.reply("No vouches have been recorded yet.");

    let description = "";
    let pos = 1;

    for (const [userId, count] of sorted) {
      const user = message.guild.members.cache.get(userId)?.user;
      const name = user ? user.tag : `Unknown User (${userId})`;
      description += `**${pos}.** ${name} — **${count}** vouches\n`;
      pos++;
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("🏆 Vouch Leaderboard")
      .setDescription(description)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
}
