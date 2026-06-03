// commands/unban.js
import { RemoveBan } from "../db.js";

export default async function unbanCommand(msg, client) {
  const args = msg.content.split(" ").slice(1);
  const userId = args[0];

  if (!msg.member.permissions.has("BanMembers")) {
    return msg.reply("You do not have permission to use this command.");
  }

  if (!userId) {
    return msg.reply("Usage: `!unban <robloxId>`");
  }

  await RemoveBan(userId);

  msg.reply(`🟩 User **${userId}** has been unbanned.`);
}
