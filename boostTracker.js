// boostTracker.js
import fs from "fs";
import path from "path";
import pkg from "discord.js";
const { EmbedBuilder } = pkg;

// ============================
// STORAGE
// ============================
const filePath = path.resolve("./boosts.json");

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

let boosts = JSON.parse(fs.readFileSync(filePath));

function save() {
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(boosts, null, 2));
  fs.renameSync(tmp, filePath);
}

const BOOST_ROLE = "1487186035153702922";
const LOG_CHANNEL = "1500564029444325416";

// ============================
// MAIN HANDLER
// ============================
export default async function boostTracker(msg, client) {
  // Only system messages
  if (msg.type !== 8 && msg.type !== 9) return;

  const user = msg.author;
  if (!user) return;

  const guild = msg.guild;
  if (!guild) return;

  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  // ============================
  // BOOST EVENT (msg.type === 8)
  // ============================
  if (msg.type === 8) {
    if (!boosts[user.id]) boosts[user.id] = 0;
    boosts[user.id] += 1;
    save();

    // If boosted twice or more → give role
    if (boosts[user.id] >= 2 && !member.roles.cache.has(BOOST_ROLE)) {
      await member.roles.add(BOOST_ROLE).catch(() => null);

      // Log embed
      const channel = client.channels.cache.get(LOG_CHANNEL);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#ff73fa")
          .setTitle("🎉 Boost Reward Granted")
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .addFields(
            { name: "User", value: `<@${user.id}>`, inline: true },
            { name: "Boost Count", value: `${boosts[user.id]}`, inline: true },
            { name: "Reward", value: `<@&${BOOST_ROLE}>` }
          )
          .setTimestamp();

        channel.send({ embeds: [embed] });
      }
    }
  }

  // ============================
  // UNBOOST EVENT (msg.type === 9)
  // ============================
  if (msg.type === 9) {
    // Remove role if they have it
    if (member.roles.cache.has(BOOST_ROLE)) {
      await member.roles.remove(BOOST_ROLE).catch(() => null);

      const channel = client.channels.cache.get(LOG_CHANNEL);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#ff4444")
          .setTitle("Boost Removed")
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .addFields(
            { name: "User", value: `<@${user.id}>`, inline: true },
            { name: "Action", value: "Unboosted the server", inline: true },
            { name: "Role Removed", value: `<@&${BOOST_ROLE}>` }
          )
          .setTimestamp();

        channel.send({ embeds: [embed] });
      }
    }
  }
}

// ============================
// COMMAND HANDLER
// ============================
export async function boostCommand(msg) {
  const target = msg.mentions.users.first() || msg.author;

  const count = boosts[target.id] || 0;

  const embed = new EmbedBuilder()
    .setColor("#ff73fa")
    .setTitle(`${target.username}'s Boost Stats`)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "Total Boosts", value: `${count}`, inline: true },
      { name: "Reward Role", value: `<@&${BOOST_ROLE}>`, inline: true }
    )
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}
