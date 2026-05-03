import fs from "fs";
import path from "path";
import { EmbedBuilder } from "discord.js";

// ============================
// BADGE SYSTEM
// ============================
function getBadge(count) {
  if (count >= 20) return "🟥 Elite";
  if (count >= 10) return "🟪 Respected";
  if (count >= 5) return "🟩 Trusted";
  return "🟦 Newcomer"; // default tier
}

export default class VouchSystem {
  constructor() {
    this.filePath = path.resolve("./vouches.json");

    // Load or initialize file
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
    }

    this.vouches = JSON.parse(fs.readFileSync(this.filePath));
    console.log("LOADED VOUCH SYSTEM FROM:", import.meta.url);
  }

  // ============================
  // SAFE SAVE (ATOMIC WRITE)
  // ============================
  save() {
    const tmp = this.filePath + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(this.vouches, null, 2));
    fs.renameSync(tmp, this.filePath);
  }

  // ============================
  // HANDLE !VOUCH
  // ============================
  async handleVouch(msg, args) {
    const target = msg.mentions.users.first();
    if (!target) {
      return msg.reply("You must mention a user to vouch for.");
    }

    if (target.id === msg.author.id) {
      return msg.reply("You cannot vouch for yourself.");
    }

    // Extract reason
    const reason = args.slice(1).join(" ");
    if (!reason) {
      return msg.reply("You must provide a reason for the vouch.");
    }

    // Ensure user entry exists
    if (!this.vouches[target.id]) {
      this.vouches[target.id] = [];
    }

    // Add vouch
    this.vouches[target.id].push({
      from: msg.author.id,
      reason,
      timestamp: Date.now()
    });

    this.save();

    // SUCCESS EMBED
    const embed = new EmbedBuilder()
      .setColor("#00ff88")
      .setTitle("Vouch Added")
      .setDescription(
        `**${msg.author.username}** vouched for **${target.username}**`
      )
      .addFields(
        { name: "Reason", value: reason },
        { name: "Total Vouches", value: `${this.vouches[target.id].length}` }
      )
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================
  // HANDLE !UNVOUCH
  // ============================
  async handleUnvouch(msg, args) {
    const target = msg.mentions.users.first();
    if (!target) {
      return msg.reply("You must mention a user to unvouch.");
    }

    const index = parseInt(args[1], 10);
    if (isNaN(index)) {
      return msg.reply("You must provide the vouch index to remove.");
    }

    if (!this.vouches[target.id] || !this.vouches[target.id][index - 1]) {
      return msg.reply("That vouch does not exist.");
    }

    const removed = this.vouches[target.id].splice(index - 1, 1);
    this.save();

    const embed = new EmbedBuilder()
      .setColor("#ff4444")
      .setTitle("Vouch Removed")
      .setDescription(
        `Removed vouch #${index} from **${target.username}**`
      )
      .addFields(
        { name: "Removed Reason", value: removed[0].reason }
      )
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================
  // HANDLE !VOUCHES (PROFILE + LIST + AVATAR)
// ============================
  async handleVouches(msg) {
    const target = msg.mentions.users.first() || msg.author;

    const list = this.vouches[target.id] || [];
    const count = list.length;

    if (count === 0) {
      return msg.reply(`${target.username} has no vouches.`);
    }

    const badge = getBadge(count);

    const formatted = list
      .map(
        (v, i) =>
          `**${i + 1}.** From <@${v.from}> — *${v.reason}*`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${target.username}'s Vouch Profile`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Total Vouches", value: `${count}`, inline: true },
        { name: "Badge", value: badge, inline: true },
        { name: "Vouches", value: formatted }
      )
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================
  // HANDLE !LEADERBOARD
  // ============================
  async handleLeaderboard(msg) {
    const entries = Object.entries(this.vouches)
      .map(([userId, arr]) => ({
        userId,
        count: arr.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (entries.length === 0) {
      return msg.reply("No vouches have been recorded yet.");
    }

    const formatted = entries
      .map(
        (e, i) =>
          `**${i + 1}. <@${e.userId}> — ${e.count} vouches**`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#ffaa00")
      .setTitle("Vouch Leaderboard")
      .setDescription(formatted)
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }
}
