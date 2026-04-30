console.log("PREFIX HANDLER VERSION 999");

export default function prefixHandler(message, client) {
  console.log("prefix handler loaded");

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

  const prefix = "!";
  if (!message.content?.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  // Log parsed command
  console.log("COMMAND PARSED:", cmd);

  // -----------------------------
  // TEST COMMAND
  // -----------------------------
  if (cmd === "testcmd") {
    return message.reply("Test command fired.")
      .catch(err => console.error("REPLY ERROR:", err));
  }

  // -----------------------------
  // PING COMMAND
  // -----------------------------
  if (cmd === "ping") {
    return message.reply("Pong!")
      .catch(err => console.error("REPLY ERROR:", err));
  }

  // -----------------------------
  // VOUCH COMMAND (placeholder)
  // -----------------------------
  if (cmd === "vouch") {
    return message.reply("Vouch command reached (placeholder).")
      .catch(err => console.error("REPLY ERROR:", err));
  }

  // -----------------------------
  // VOUCHES COMMAND (placeholder)
  // -----------------------------
  if (cmd === "vouches") {
    return message.reply("Vouches command reached (placeholder).")
      .catch(err => console.error("REPLY ERROR:", err));
  }
}
