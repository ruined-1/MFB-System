// index.js

// ===============================
// FORCE OLD INSTANCE TO SHUT DOWN
// ===============================
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM — finishing pending saves...");

  await new Promise(res => setTimeout(res, 500));
  await CloseDatabaseConnection();

  console.log("Shutdown complete.");
  process.exit(0);
});

const startupDelay = async () => {
  await new Promise(res => setTimeout(res, 2000));
};
await startupDelay();

// ===============================
// WEB SERVER
// ===============================
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// ===============================
// DISCORD BOT
// ===============================
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import { CloseDatabaseConnection, ConnectToDatabase } from "./db.js";

// Handlers
import prefix from "./prefix.js";
// import alertHandler from "./dupe_DISABLED/alerts.js";
// import resetCooldown from "./dupe_DISABLED/resetCooldown.js";
import boostTracker from "./boostTracker.js";

import { handleJoin, handleMessage } from "./antiRaid.js";
import {
  handleChannelDelete,
  handleRoleDelete,
  handleGuildBanAdd,
  handleGuildMemberRemove,
  handleWebhookUpdate
} from "./antiNuke.js";

// Systems
// import CooldownSystem from "./cooldownSystem.js";
import SeveritySystem from "./severitySystem.js";
import ThresholdSystem from "./thresholdSystem.js";
import VouchSystem from "./vouchSystem.js";

// SETTINGS SYSTEM
import settingsCommand from "./settings/settingsCommand.js";
import registerSettingsRouter from "./settings/settingsRouter.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks
  ],
  partials: []
});

// Attach systems
// client.cooldownSystem = new CooldownSystem();
client.severitySystem = new SeveritySystem();
client.thresholdSystem = new ThresholdSystem();
client.vouchSystem = new VouchSystem();

await ConnectToDatabase();

// ===============================
// AFK SYSTEM
// ===============================
client.afk = {
  enabled: false,
  reason: ""
};

// ===============================
// PREFIX COMMANDS + AFK LOGIC
// ===============================
client.on("messageCreate", async (msg) => {
  if (msg.partial) return;
  if (msg.author.bot) return;

  // AFK AUTO-CLEAR
  if (msg.author.id === "775991906173452288" && client.afk.enabled) {
    client.afk.enabled = false;
    client.afk.reason = "";
    msg.reply("🟩 Welcome back — AFK removed.");
  }

  // AFK NOTIFY
  if (client.afk.enabled) {
    const ruinedId = "775991906173452288";

    let isReply = false;
    if (msg.reference?.messageId) {
      try {
        const replied = await msg.channel.messages.fetch(msg.reference.messageId);
        isReply = replied.author.id === ruinedId;
      } catch {}
    }

    const pinged =
      msg.mentions.users.has(ruinedId) ||
      msg.content.includes(`<@${ruinedId}>`) ||
      msg.content.includes(`<@!${ruinedId}>`) ||
      isReply;

    if (pinged) {
      return msg.reply(
        `💤 <@${ruinedId}> is currently **AFK**.\nReason: **${client.afk.reason}**`
      );
    }
  }

  // SETTINGS COMMAND
  try {
    await settingsCommand(msg, client);
  } catch (err) {
    console.error("Settings command error:", err);
  }

  // PREFIX COMMANDS
  if (msg.content.startsWith("!")) {
    try {
      await prefix(msg, client);
    } catch (err) {
      console.error("Prefix error:", err);
    }
  }
});

// ===============================
// ALERTS
// ===============================
client.on("messageCreate", async (msg) => {
  try {
    await alertHandler(msg, client);
  } catch (err) {
//   console.error("Alert handler error:", err);
  }
 });

// ===============================
// BOOST TRACKER
// ===============================
client.on("messageCreate", async (msg) => {
  try {
    await boostTracker(msg, client);
  } catch (err) {
    console.error("Boost tracker error:", err);
  }
});

// ===============================
// ANTI-RAID
// ===============================
client.on("messageCreate", async (msg) => {
  try {
    await handleMessage(msg, client);
  } catch (err) {
    console.error("Anti-raid message error:", err);
  }
});

client.on("guildMemberAdd", async (member) => {
  try {
    await handleJoin(member, client);
  } catch (err) {
    console.error("Anti-raid join error:", err);
  }
});

// ===============================
// ANTI-NUKE
// ===============================
client.on("channelDelete", async (channel) => {
  try {
    await handleChannelDelete(channel, client);
  } catch (err) {
    console.error("Anti-nuke channelDelete error:", err);
  }
});

client.on("roleDelete", async (role) => {
  try {
    await handleRoleDelete(role, client);
  } catch (err) {
    console.error("Anti-nuke roleDelete error:", err);
  }
});

client.on("guildBanAdd", async (ban) => {
  try {
    await handleGuildBanAdd(ban, client);
  } catch (err) {
    console.error("Anti-nuke guildBanAdd error:", err);
  }
});

client.on("guildMemberRemove", async (member) => {
  try {
    await handleGuildMemberRemove(member, client);
  } catch (err) {
    console.error("Anti-nuke guildMemberRemove error:", err);
  }
});

client.on("webhookUpdate", async (channel) => {
  try {
    await handleWebhookUpdate(channel, client);
  } catch (err) {
    console.error("Anti-nuke webhookUpdate error:", err);
  }
});

// ===============================
// BUTTONS + SETTINGS INTERACTIONS
// ===============================
registerSettingsRouter(client);

client.on("interactionCreate", async (interaction) => {
  try {
    await resetCooldown(interaction, client);
  } catch (err) {
    console.error("Button error:", err);
  }
});

// STATUS [Render Safe]
client.once("ready", () => {
//   console.log(`Logged in as ${client.user.tag}`);

  // Delay to let render boot before setting status
  setTimeout(() => {
    client.user.setPresence({
      status: "online",
      activities: [
        {
          name: "everything.",
          type: 3 // (Watching)
        }
      ]
    });

    console.log("Presence Set Successfully.");
  }, 1500); // 1.5s delay
 });

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
