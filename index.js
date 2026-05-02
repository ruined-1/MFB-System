import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} from "discord.js";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Prefix handler
import handlePrefix from "./prefix.js";
// Dupe alerts
import handleAlert from "./dupe/alerts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");
  if (!fs.existsSync(commandsPath)) return;

  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  for (const file of files) {
    const mod = await import(`./commands/${file}`);
    const cmd = mod.default;
    if (!cmd?.data?.name || typeof cmd.execute !== "function") continue;
    client.commands.set(cmd.data.name, cmd);
  }
  console.log(`Loaded ${client.commands.size} slash commands`);
}

client.once("ready", async () => {
  console.log("MAIN clientReady fired");
  await loadCommands();
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  console.log("MAIN messageCreate fired");

  if (msg.author.bot) return;

  // Prefix commands
  if (msg.content.startsWith("!")) {
    return handlePrefix(msg, client);
  }

  // Webhook alerts (dupe system)
  if (msg.webhookId) {
    return handleAlert(msg, client);
  }
});

client.on("interactionCreate", async (interaction) => {
  // SETTINGS PANEL BUTTONS
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const id = interaction.customId;

  if (id === "settings_threshold") {
    return interaction.reply({
      content: "Use `/threshold` to view or set the dupe threshold.",
      ephemeral: true
    });
  }

  if (id === "settings_cooldowns") {
    return interaction.reply({
      content: "Use `/cooldown` to manage cooldowns.",
      ephemeral: true
    });
  }

  if (id === "settings_severity") {
    return interaction.reply({
      content: "Use `/severity` to test severity levels.",
      ephemeral: true
    });
  }

  if (id === "settings_vouchboard") {
    const { default: leaderboard } = await import("./commands/vouchboard.js");
    return leaderboard(interaction);
  }
});
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: "There was an error while executing this command.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);

// keep-alive
const app = express();
app.get("/", (_req, res) => res.send("Bot is running"));
app.listen(10000, () => console.log("Fake web server running on port 10000"));
