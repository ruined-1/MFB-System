console.log("PREFIX HANDLER VERSION 1004");

export default function prefixHandler(message, client) {
  if (message.author?.bot) return;
  if (message.webhookId) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift()?.toLowerCase();

  console.log("COMMAND PARSED:", cmd);

  // -----------------------------
  // TEST COMMAND
  // -----------------------------
  if (cmd === "testcmd") {
    return message.channel.send({
      content: "Test command fired.",
      allowedMentions: { repliedUser: false }
    }).catch(err => console.error("SEND ERROR:", err));
  }

  // -----------------------------
  // PING
  // -----------------------------
  if (cmd === "ping") {
    return message.channel.send({
      content: "Pong!",
      allowedMentions: { repliedUser: false }
    }).catch(err => console.error("SEND ERROR:", err));
  }

  // -----------------------------
  // ⭐ CLEAN EMBED: VOUCH FIRED (NO HIGHLIGHT ANYWHERE)
  // -----------------------------
  if (cmd === "vouch") {
    const embed = {
      title: "Vouch fired.",
      description: "Vouch fired.",
      color: 0xFF0000, // red sidebar
      footer: {
        text: "MFB System"
      },
      timestamp: new Date().toISOString()
    };

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { repliedUser: false }
    }).catch(err => console.error("SEND ERROR:", err));
  }
}
