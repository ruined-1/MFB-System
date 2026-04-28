import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes
} from "discord.js";

import { vouches } from "./vouches.js";
import { saveVouches } from "./saveVouches.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// ⭐ ONLY WATCH THIS CHANNEL
const LOG_CHANNEL = "1496011804634120372";

// ⭐ ALERTS STILL GO HERE
const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

// ⭐ Dynamic threshold
let dupeThreshold = 20;

// ------------------------------------------------------------
// AUTO‑DEPLOY SLASH COMMANDS (GUILD — INSTANT)
// ------------------------------------------------------------
async function deploySlashCommands() {
  const commands = [
    {
      name: "setthreshold",
      description: "Set the dupe alert threshold",
      options: [
        {
          name: "number",
          description: "Minimum amount owned to trigger an alert",
          type: 4,
          required: true
        }
      ]
    }
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("Deploying slash commands to guild…");

    await rest.put(
      Routes.applicationGuildCommands(
        "1490173403032977519",
        "1139943473437495457"
      ),
      { body: commands }
    );

    console.log("Guild slash commands deployed instantly.");
  } catch (err) {
    console.error("Slash deploy error:", err);
  }
}

client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "I see you, dupers." }],
    status: "online"
  });

  deploySlashCommands();
});

// ------------------------------------------------------------
// MESSAGE HANDLER (FINAL, DUPLICATION‑FREE VERSION)
// ------------------------------------------------------------
client.on("messageCreate", async (message) => {

  // ⭐ Ignore ALL bot messages (fixes prefix duplication)
  // Webhook messages are NOT blocked here because they have no author.bot
  if (message.author.bot) return;

  // ⭐ Ignore webhook messages everywhere EXCEPT celestial logs
  if (message.webhookId && message.channel.id !== LOG_CHANNEL) return;

  const isCommand =
    message.content.startsWith("!") &&
    !message.webhookId &&
    message.channel.id !== LOG_CHANNEL;

  const isCelestial = message.channel.id === LOG_CHANNEL;

  // ------------------------------------------------------------
  // PREFIX COMMANDS (NOW SINGLE‑FIRE)
  // ------------------------------------------------------------
  if (isCommand) {
    const args = message.content.trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();

    if (cmd === "!setthreshold") {
      const value = parseInt(args[0], 10);

      if (isNaN(value) || value < 1) {
        return message.reply("Please provide a valid number greater than 0.");
      }

      dupeThreshold = value;
      return message.reply(`Dupe alert threshold updated to **${dupeThreshold}**.`);
    }

    if (cmd === "!vouch") {
      const target = message.mentions.users.first();
      if (!target) return message.reply("You must mention someone to vouch.");
      if (target.id === message.author.id)
        return message.reply("You cannot vouch yourself.");

      vouches[target.id] = (vouches[target.id] ?? 0) + 1;
      saveVouches(vouches);

      return message.reply(
        `You vouched for **${target.tag}**. They now have **${vouches[target.id]}** vouches.`
      );
    }

    if (cmd === "!vouches") {
      const target = message.mentions.users.first() || message.author;
      const count = vouches[target.id] ?? 0;

      const embed = new EmbedBuilder()
        .setColor("#00AEEF")
        .setTitle(`${target.username}'s Vouch Profile`)
        .setThumbnail(target.displayAvatarURL({ size: 1024 }))
        .addFields(
          { name: "Total Vouches", value: `${count}`, inline: true },
          { name: "User ID", value: target.id, inline: true }
        )
        .setFooter({ text: "Vouch System" })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (cmd === "!leaderboard") {
      const sorted = Object.entries(vouches)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (sorted.length === 0)
        return message.reply("No vouches have been recorded yet.");

      let description = "";
      let position = 1;

      for (const [userId, count] of sorted) {
        const user = message.guild.members.cache.get(userId)?.user;
        const name = user ? user.tag : `Unknown User (${userId})`;
        description += `**${position}.** ${name} — **${count}** vouches\n`;
        position++;
      }

      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("🏆 Vouch Leaderboard")
        .setDescription(description)
        .setFooter({ text: "Top vouched users" })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    return;
  }

  // ------------------------------------------------------------
  // CELESTIAL LOG PARSER (ALERTS WORKING PERFECTLY)
  // ------------------------------------------------------------
  if (isCelestial) {
    const text = message.content;

    const extract = (label) => {
      const regex = new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i");
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const userField = extract("User");
    const brainrotField = extract("Brainrot");
    const amountField = extract("Amount owned");
    const upgradeField = extract("Upgrade");
    const playtimeField = extract("Playtime");
    const cashField = extract("Cash");

    if (!amountField) return;

    const amountOwned = parseInt(amountField.match(/\d+/)?.[0] || "0", 10);

    if (amountOwned >= dupeThreshold) {
      const alertChannel = message.guild.channels.cache.get(ALERT_CHANNEL);

      const embedAlert = new EmbedBuilder()
        .setColor("#FFCC00")
        .setTitle("⚠️ Possible dupe detected")
        .setDescription(
          `• **User:** ${userField || "Unknown"}\n` +
          `• **Brainrot:** ${brainrotField || "Unknown"}\n` +
          `• **Amount owned:** ${amountOwned}\n` +
          `• **Upgrade:** ${upgradeField || "Unknown"}\n` +
          `• **Playtime:** ${playtimeField || "Unknown"}\n` +
          `• **Cash:** ${cashField || "Unknown"}\n` +
          `• **Source:** <#${LOG_CHANNEL}> — [Jump to message](${message.url})`
        )
        .setTimestamp();

      alertChannel.send({
        content: `<@${PING_USER}>`,
        embeds: [embedAlert]
      });
    }
  }
});

// ------------------------------------------------------------
// SLASH COMMAND HANDLER
// ------------------------------------------------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "setthreshold") {
    const value = interaction.options.getInteger("number");

    if (value < 1) {
      return interaction.reply({
        content: "Please provide a number greater than 0.",
        ephemeral: true
      });
    }

    dupeThreshold = value;

    return interaction.reply(
      `Dupe alert threshold updated to **${dupeThreshold}**.`
    );
  }
});

client.login(process.env.TOKEN);
