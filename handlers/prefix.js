console.log("prefix handler loaded");
// handlers/prefix.js

export default function prefixHandler(message, client) {

  // Ignore bot, webhook, system, or empty messages
  if (!message || !message.content) return;
  if (message.author?.bot) return;
  if (message.webhookId) return;
  if (message.system) return;

  // HARD LOCK: prevents duplicates from overlapping Render instances
  if (message._prefixHandled) return;
  message._prefixHandled = true;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "vouches") {
    message.reply("Vouch system is working.");
  }
}
