// commands/ban.js
import { AddBan } from "../db.js";

export default async function banCommand(msg, client) {
  const args = msg.content.split(" ").slice(1);
  const userId = args[0];
  const reason = args.slice(1).join(" ");

  if (!msg.member.permissions.has("BanMembers")) {
    return msg.reply("You do not have permission to use this command.");
  }

  if (!userId || !reason) {
    return msg.reply("Usage: `!ban <robloxId> <reason>`");
  }

  await AddBan(userId, reason, msg.author.username);

  msg.reply(`🚫 User **${userId}** has been banned.\nReason: **${reason}**`);
}
