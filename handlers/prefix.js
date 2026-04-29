console.log("prefix handler loaded");

export default function prefixHandler(message, client) {
  console.log("MSG:", message.content);

  if (!message || !message.content) return;
  if (message.author?.bot) return;
  if (message.webhookId) return;
  if (message.system) return;

  // Prevent ONLY prefix duplicates
  if (message._prefixProcessed) return;
  message._prefixProcessed = true;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "vouches") {
    message.reply("Vouch system is working.");
  }
}
