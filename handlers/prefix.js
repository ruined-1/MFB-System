console.log("PREFIX HANDLER VERSION 1002");

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
    return message.reply("Test command fired.")
      .catch(err => console.error("REPLY ERROR:", err));
  }

  // -----------------------------
  // PING
  // -----------------------------
  if (cmd === "ping") {
    return message.reply("Pong!")
      .catch(err => console.error("REPLY ERROR:", err));
  }

  // -----------------------------
  // ⭐ CLEAN EMBED: VOUCH FIRED
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

    return message.reply({ embeds: [embed] })
      .catch(err => console.error("REPLY ERROR:", err));
  }
}
