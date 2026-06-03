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

app.use(express.json());

// Ban API route
import banRoutes from "./api/banRoutes.js";
app.use("/api", banRoutes);

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// ===============================
// DISCORD BOT
// ===============================
import { Client, GatewayIntentBits, ActivityType, Collection } from "discord.js";
import { CloseDatabaseConnection, ConnectToDatabase } from "./db.js";
import fs from "fs";
import path from "path";

// Handlers
import prefix from "./prefix.js";
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
import VouchSystem from "./vouchSystem.js";

// SETTINGS SYSTEM
import settingsCommand from "./settings/settingsCommand.js";
import registerSettingsRouter from "./settings/settingsRouter.js";

// BUG REPORT SYSTEM IMPORTS
import { handleBugButton, handleBugStatus, handleDM } from "./bug/bugReport.js";

// SUGGESTION SYSTEM IMPORTS
import {
  getSuggestionPanel,
  handleSuggestionButton,
  handleSuggestionDM
} from "./suggestions/suggestionSystem.js";

// Prefix ban commands
// import banCommand from "./commands/ban.js";
// import unbanCommand from "./commands/unban.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

// Attach systems
client.vouchSystem = new VouchSystem();

await ConnectToDatabase();

// ===============================
// LOAD SLASH COMMANDS
// ===============================
client.slashCommands = new Collection();

const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = await import(`./commands/${file}`);
  if (cmd.default?.data) {
    client.slashCommands.set(cmd.default.data.name, cmd.default);
  }
}

// ===============================
// AFK SYSTEM
// ===============================
client.afk = {
  enabled: false,
  reason: ""
};

// ===============================
// PREFIX COMMANDS + AFK LOGIC + DM ROUTING
// ===============================
client.on("messageCreate", async (msg) => {
  if (msg.partial) return;
  if (msg.author.bot) return;

  // ⭐ BUG REPORT SYSTEM — DM HANDLER ⭐
  if (msg.channel.type === 1) {
    await handleDM(msg, client);
    await handleSuggestionDM(msg, client);
    return;
  }

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
    const args = msg.content.slice(1).split(" ");
    const cmd = args.shift().toLowerCase();

    if (cmd === "ban") return banCommand(msg, client);
    if (cmd === "unban") return unbanCommand(msg, client);

    try {
      await prefix(msg, client);
    } catch (err) {
      console.error("Prefix error:", err);
    }
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

// ==============================
// BUTTONS + SETTINGS INTERACTIONS
// ==============================
registerSettingsRouter(client);

client.on("interactionCreate", async (interaction) => {
  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const cmd = client.slashCommands.get(interaction.commandName);
      if (cmd) return cmd.execute(interaction);
    }

    // Buttons
    if (interaction.isButton()) {
      await handleBugButton(interaction, client);
      await handleBugStatus(interaction, client);
      await handleSuggestionButton(interaction, client);
    }
  } catch (err) {
    console.error("Interaction error:", err);
  }
});

// ===============================
// STATUS [Render Safe]
// ===============================
client.once("ready", () => {
  setTimeout(() => {
    client.user.setPresence({
      status: "online",
      activities: [
        {
          name: "everything.",
          type: 3 // Watching
        }
      ]
    });

    console.log("Presence Set Successfully.");
  }, 1500);
});

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
