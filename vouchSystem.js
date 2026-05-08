import { EmbedBuilder } from "discord.js";
import { GetVouches, SaveVouch, GetAllVouches, DeleteVouch } from "./db.js";

// ============================
// BADGE SYSTEM
// ============================
function getBadge(count) {
  if (count >= 20) return "🟥 Elite";
  if (count >= 10) return "🟪 Respected";
  if (count >= 5) return "🟩 Trusted";
  return "🟦 Newcomer";
}

export default class VouchSystem {

  // ============================
  // HANDLE !VOUCH
  // ============================
  async handleVouch(msg, args) {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("You must mention a user to vouch for.");

    if (target.id === msg.author.id) {
      return msg.reply("You cannot vouch for yourself.");
    }

    if (target.bot) {
      return msg.reply("You cannot vouch for bots.");
    }

    const reason = args.slice(1).join(" ");
    if (!reason) return msg.reply("You must provide a reason for the vouch.");

    const vouchData = {
      userId: target.id,
      from: msg.author.id,
      reason,
      timestamp: Date.now()
    };

    await SaveVouch(vouchData);

    const userVouches = await GetVouches(target.id);

    const embed = new EmbedBuilder()
      .setColor("#00ff88")
      .setTitle("Vouch Added")
      .setDescription(
        `**${msg.author.username}** vouched for **${target.username}**`
      )
      .addFields(
        { name: "Reason", value: reason },
        { name: "Total Vouches", value: `${userVouches.length}` }
      )
      .setTimestamp();

    await msg.reply({ embeds: [embed] });

    // LOG CHANNEL
    const logChannel = msg.client.channels.cache.get("1500564029444325416");
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("Vouch Logged")
        .setThumbnail(target.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: "Vouched User", value: `<@${target.id}>`, inline: true },
          { name: "From", value: `<@${msg.author.id}>`, inline: true },
          { name: "Reason", value: reason },
          { name: "Total Vouches", value: `${this.vouches[target.id].length}` }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    } 
  }

  // ============================
  // HANDLE !UNVOUCH
  // ============================
  async handleUnvouch(msg, args) {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("You must mention a user to unvouch.");

    const index = parseInt(args[1], 10);
    if (isNaN(index)) return msg.reply("You must provide the vouch index to remove.");

    const vouch = vouches[index - 1];

    if (!vouch ) {
      return msg.reply("That vouch does not exist.");
    }

    if (vouch.from !== msg.author.id) {
      return msg.reply("You can only remove vouches you have given.");
    }

    await DeleteVouch(vouch._id);

    const embed = new EmbedBuilder()
      .setColor("#ff4444")
      .setTitle("Vouch Removed")
      .setDescription(`Removed vouch #${index} from **${target.username}**`)
      .addFields({ name: "Removed Reason", value: vouch.reason })
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  // ============================
  // HANDLE !VOUCHES
  // ============================
  async handleVouches(msg) {
    const target = msg.mentions.users.first() || msg.author;

    const list = await GetVouches(target.id);
    const count = list.length;

    if (count === 0) {
      return msg.reply(`${target.username} has no vouches.`);
    }

    const badge = getBadge(count);

    const formatted = list
      .map((v, i) => `**${i + 1}.** From <@${v.from}> — *${v.reason}*`)
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
    const all = await GetAllVouches();

    const counts = {};

    for (const v of all) {
      counts[v.userId] = (counts[v.userId] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (sorted.length === 0) {
      return msg.reply("No vouches have been recorded yet.");
    }

    const formatted = sorted
      .map((e, i) => `**${i + 1}. <@${e.userId}> — ${e.count} vouches**`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#ffaa00")
      .setTitle("Vouch Leaderboard")
      .setDescription(formatted)
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }
}