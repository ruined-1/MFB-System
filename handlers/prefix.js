console.log("prefix handler loaded");

export default function prefixHandler(message, client) {
  // Log EVERYTHING the bot sees
  console.log("RAW MSG:", {
    id: message.id,
    content: message.content,
    authorId: message.author?.id,
    authorBot: message.author?.bot,
    webhookId: message.webhookId,
    channelId: message.channelId,
  });

  // Ignore bots (including itself)
  if (message.author?.bot) return;

  // Ignore webhooks
  if (message.webhookId) return;

  // Basic prefix handling
  const prefix = "!";
  if (!message.content?.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "vouches") {
    message.reply("Vouch system is working.");
  }

  if (cmd === "ping") {
    message.reply("Pong!");
  }
}
