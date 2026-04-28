console.log("BOT INSTANCE STARTED");
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
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildWebhooks
  ]
});

// ⭐ ONLY WATCH THIS CHANNEL FOR CELESTIAL LOGS
const LOG_CHANNEL = "1496011804634120372";

// ⭐ ALERTS STILL GO HERE
const ALERT_CHANNEL = "1496324911084470473";
const PING_USER = "967946056572747776";

// ⭐ Dynamic threshold
let dupeThreshold = 20;

// ⭐ Cooldown system
const alertCooldowns = new Map();
let COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes

function isOnCooldown(userId) {
  const last = alertCooldowns.get(userId);
  if (!last) return false;
  return Date.now() - last < COOLDOWN_TIME;
}

function setCooldown(userId) {
  alertCooldowns.set(userId, Date.now());
}

function getCooldownRemaining(userId) {
  const last = alertCooldowns.get(userId);
  if (!last) return 0;
  return Math.max(0, COOLDOWN_TIME - (Date.now() - last));
}

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
// MESSAGE HANDLER (CLEANED + FIXED)
// ------------------------------------------------------------
client.on("messageCreate", async (message) => {

  // ⭐ Ignore ALL bot + webhook messages EXCEPT celestial logs
  if ((message.author.bot || message.webhookId) && message.channel.id !== LOG_CHANNEL) {
    return;
  }

  const isCommand =
    message.content.startsWith("!") &&
    !message.author.bot &&
    !message.webhookId &&
    message.channel.id !== LOG_CHANNEL;

  const isCelestial = message.channel.id === LOG_CHANNEL;

  // ------------------------------------------------------------
  // PREFIX COMMANDS (NOW WORKING PROPERLY)
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

    return; // end command handling
  }

  // ------------------------------------------------------------
  // CELESTIAL LOG PARSER (CLEAN + SAFE)
  // ------------------------------------------------------------
  if (isCelestial) {
    const text = message.content;

    const extract = (label) => {
      const regex = new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i");
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const userField = extract("User");
    const idMatch = userField?.match(/\(ID:\s*(\d+)\)/i);
    const realUserId = idMatch ? idMatch[1] : "unknown";

    const brainrotField = extract("Brainrot");
    const amountField = extract("Amount owned");
    const upgradeField = extract("Upgrade");
    const playtimeField = extract("Playtime");
    const cashField = extract("Cash");

    if (!amountField) return;

    const amountOwned = parseInt(amountField.match(/\d+/)?.[0] || "0", 10);

    if (amountOwned >= dupeThreshold) {

      // ⭐ Cooldown check
      const remaining = getCooldownRemaining(realUserId);
      if (remaining > 0) {
        console.log(`Cooldown active for ${realUserId}, skipping alert.`);
        return;
      }

      setCooldown(realUserId);

      const minutes = Math.ceil(COOLDOWN_TIME / 60000);
      const endTime = new Date(Date.now() + COOLDOWN_TIME)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
          `• **Cash:** ${cashField || "Unknown"}\n\n` +
          `• **Cooldown:** ${minutes} minutes (ends at ${endTime})\n\n` +
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
