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

  // ============================================================
  // !vouch @user reason
  // ============================================================
  async handleVouch(msg, args) {
    const target = msg.mentions.users.first();

    // No mention
    if (!target) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Invalid Vouch")
        .setColor(0xff0000)
        .setDescription("You must **mention a user** to vouch for.");
      return msg.reply({ embeds: [embed] });
    }

    // Can't vouch for yourself
    if (target.id === msg.author.id) {
      const embed = new EmbedBuilder()
        .setTitle("❌ You Can't Vouch For Yourself")
        .setColor(0xff0000)
        .setDescription("You cannot vouch for **yourself**.");
      return msg.reply({ embeds: [embed] });
    }

    // Can't vouch for bots
    if (target.bot) {
      const embed = new EmbedBuilder()
        .setTitle("❌ You Can't Vouch For Bots")
        .setColor(0xff0000)
        .setDescription("Bots cannot receive vouches.");
      return msg.reply({ embeds: [embed] });
    }

    // Remove the mention from args
    args.shift();
    const reason = args.join(" ");
    if (!reason) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Missing Reason")
        .setColor(0xff0000)
        .setDescription("You must provide a **reason** for your vouch.");
      return msg.reply({ embeds: [embed] });
    }

    // Save vouch
    if (!this.data[target.id]) this.data[target.id] = [];
    this.data[target.id].push({
      from: msg.author.id,
      reason,
      timestamp: Date.now()
    });

    this.save();

    // Success embed
    const embed = new EmbedBuilder()
      .setTitle("✅ Vouch Recorded")
      .setColor(0x00ff00)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "From", value: `<@${msg.author.id}>`, inline: true },
        { name: "To", value: `<@${target.id}>`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================================================
  // !vouches
  // ============================================================
  async handleVouches(msg) {
    const user = msg.mentions.users.first() || msg.author;
    const list = this.data[user.id] || [];

    if (list.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Vouches`)
        .setColor(0x3498db)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setDescription("This user has **no vouches**.");
      return msg.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Vouch Profile`)
      .setColor(0x3498db)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        list
          .map(
            (v, i) =>
              `**${i + 1}.** From <@${v.from}> — *${v.reason}*`
          )
          .join("\n")
      )
      .setFooter({ text: `Total vouches: ${list.length}` });

    return msg.reply({ embeds: [embed] });
  }

  // ============================================================
  // !leaderboard
  // ============================================================
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
