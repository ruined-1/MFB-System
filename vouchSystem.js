// vouchSystem.js
import { EmbedBuilder } from "discord.js";
import fs from "fs";

const DATA_FILE = "./data/vouches.json";

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export default class VouchSystem {
  constructor() {
    this.data = loadData();
  }

  save() {
    saveData(this.data);
  }

  // !vouch @user reason
  async handleVouch(msg, args) {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("You must mention a user to vouch for.");

    args.shift(); // remove mention
    const reason = args.join(" ");
    if (!reason) return msg.reply("You must provide a reason.");

    if (!this.data[target.id]) this.data[target.id] = [];
    this.data[target.id].push({
      from: msg.author.id,
      reason,
      timestamp: Date.now()
    });

    this.save();

    return msg.reply(`Vouch recorded for **${target.username}**.`);
  }

  // !vouches
  async handleVouches(msg) {
    const user = msg.mentions.users.first() || msg.author;
    const list = this.data[user.id] || [];

    if (list.length === 0)
      return msg.reply(`${user.username} has no vouches.`);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Vouches`)
      .setColor(0x3498db)
      .setDescription(
        list
          .map(
            (v, i) =>
              `**${i + 1}.** From <@${v.from}> — *${v.reason}*`
          )
          .join("\n")
      );

    return msg.reply({ embeds: [embed] });
  }

  // !leaderboard
  async handleLeaderboard(msg) {
    const entries = Object.entries(this.data)
      .map(([id, vouches]) => ({ id, count: vouches.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (entries.length === 0)
      return msg.reply("No vouches recorded yet.");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Vouch Leaderboard")
      .setColor(0xf1c40f)
      .setDescription(
        entries
          .map(
            (e, i) =>
              `**${i + 1}.** <@${e.id}> — **${e.count}** vouches`
          )
          .join("\n")
      );

    return msg.reply({ embeds: [embed] });
  }
}
