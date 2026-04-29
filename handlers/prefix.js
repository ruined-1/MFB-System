// handlers/prefix.js

export default function prefixHandler(message) {

  // HARD LOCK: ignore bot, webhook, system, or empty messages
  if (!message || !message.content) return;
  if (message.author?.bot) return;
  if (message.webhookId) return;
  if (message.system) return;

  // HARD LOCK: prevent duplicate firing from overlapping instances
  if (message._handledPrefix) return;
  message._handledPrefix = true;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "vouches") {
    message.reply("Vouch system is working.");
  }
}
