import {
  Client,
  GatewayIntentBits,
  REST,
  Routes
} from "discord.js";

import prefixHandler from "./handlers/prefix.js";
import alertHandler from "./handlers/alerts.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const LOG_CHANNEL = "1496011804634120372";

client.once("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "I see you, dupers." }],
    status: "online"
  });
});

// ⭐ Load handlers
client.on("messageCreate", (msg) => prefixHandler(msg, client));
client.on("messageCreate", (msg) => alertHandler(msg, client, LOG_CHANNEL));

client.login(process.env.TOKEN);
