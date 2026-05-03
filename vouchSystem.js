// vouchSystem.js
import { EmbedBuilder } from "discord.js";
import fs from "fs";

const DATA_FILE = "./data/vouches.json";

// ============================================================
// SAFE LOAD + ATOMIC SAVE
// ============================================================
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveData(data) {
  const tmp = DATA_FILE + ".tmp";

  // Write to temp file first
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));

  // Atomic replace
  fs.renameSync(tmp, DATA_FILE);
}

// ============================================================
// BADGE SYSTEM
// ============================================================
function getBadge(vouchCount) {
  if (vouchCount >= 50) return "🟥 **Elite**";
  if (vouchCount >= 20) return "🟧 **Respected**";
  if (vouchCount >= 10) return "🟨 **Reputable**";
  if (vouchCount >= 5) return "🟩 **Trusted**";
  if (vouchCount >= 1) return "🟦 **Newcomer**";
  return "⬛ **Unranked**";
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

    // Extract reason safely (bulletproof)
    const reason = msg.content.split(" ").slice(2).join(" ").trim();
    if (!reason) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Missing Reason")
        .setColor(0xff0000)
        .setDescription("You must provide a **reason** for your vouch.");
      return msg.reply({ embeds: [embed] });
    }

    // Ensure array exists (fixes silent push failures)
    if (!Array.isArray(this.data[target.id])) {
      this.data[target.id] = [];
    }

    // Save vouch
    this.data[target.id].push({
      from: msg.author.id,
      reason,
      timestamp: Date.now()
    });

    this.save();

    const totalVouches = this.data[target.id].length;
    const badge = getBadge(totalVouches);

    // ============================================================
    // SUCCESS EMBED (GUARANTEED TO FIRE)
    // ============================================================
    const embed = new EmbedBuilder()
      .setTitle("🎉 Vouch Successful")
      .setColor(0x2ecc71)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(`Your vouch for **${target.username}** has been recorded.`)
      .addFields(
        { name: "From", value: `<@${msg.author.id}>`, inline: true },
        { name: "To", value: `<@${target.id}>`, inline: true },
        { name: "Reason", value: reason },
        { name: "Total Vouches", value: `**${totalVouches}**`, inline: true },
        { name: "Badge", value: badge, inline: true }
      )
      .setFooter({ text: "Vouch added successfully" })
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================================================
  // !unvouch @user <index>
  // ============================================================
  async handleUnvouch(msg, args) {
    const target = msg.mentions.users.first();

    if (!target) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Invalid Unvouch")
        .setColor(0xff0000)
        .setDescription("You must **mention a user** to remove a vouch from.");
      return msg.reply({ embeds: [embed] });
    }

    if (target.bot) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Invalid Unvouch")
        .setColor(0xff0000)
        .setDescription("Bots do not have vouches.");
      return msg.reply({ embeds: [embed] });
    }

    if (!Array.isArray(this.data[target.id]) || this.data[target.id].length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("❌ No Vouches Found")
        .setColor(0xff0000)
        .setDescription(`${target.username} has **no vouches** to remove.`);
      return msg.reply({ embeds: [embed] });
    }

    args.shift();
    const index = parseInt(args[0]);

    if (!index || index < 1 || index > this.data[target.id].length) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Invalid Vouch Number")
        .setColor(0xff0000)
        .setDescription(
          `Please provide a valid vouch number between **1** and **${this.data[target.id].length}**.`
        );
      return msg.reply({ embeds: [embed] });
    }

    const removed = this.data[target.id].splice(index - 1, 1)[0];
    this.save();

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Vouch Removed")
      .setColor(0xe67e22)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(`A vouch has been removed from **${target.username}**.`)
      .addFields(
        { name: "Removed Vouch", value: `*${removed.reason}*` },
        { name: "Originally From", value: `<@${removed.from}>`, inline: true }
      )
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================================================
  // !vouches
  // ============================================================
  async handleVouches(msg) {
    const user = msg.mentions.users.first() || msg.author;
    const list = Array.isArray(this.data[user.id]) ? this.data[user.id] : [];
    const total = list.length;
    const badge = getBadge(total);

    if (total === 0) {
      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Vouch Profile`)
        .setColor(0x3498db)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setDescription("This user has **no vouches**.")
        .addFields({ name: "Badge", value: badge });
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
      .addFields(
        { name: "Total Vouches", value: `**${total}**`, inline: true },
        { name: "Badge", value: badge, inline: true }
      )
      .setFooter({ text: `Total vouches: ${total}` });

    return msg.reply({ embeds: [embed] });
  }

  // ============================================================
  // !leaderboard
  // ============================================================
  async handleLeaderboard(msg) {
    const entries = Object.entries(this.data)
      .filter(([_, v]) => Array.isArray(v))
      .map(([id, vouches]) => ({ id, count: vouches.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (entries.length === 0)
      return msg.reply("No vouches recorded yet.");

    const description = entries
      .map((e, i) => {
        const badge = getBadge(e.count);
        return `**${i + 1}.** <@${e.id}> — **${e.count}** vouches — ${badge}`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Vouch Leaderboard")
      .setColor(0xf1c40f)
      .setDescription(description);

    return msg.reply({ embeds: [embed] });
  }
}
