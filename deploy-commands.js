// deploy-commands.js
import { REST, Routes } from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";

const commands = [];
const commandsPath = path.resolve("./commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = await import(`./commands/${file}`);
  commands.push(cmd.default.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {
  console.log("Deploying slash commands...");
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, "1139943473437495457"),
    { body: commands }
  );
  console.log("Slash commands deployed.");
} catch (err) {
  console.error(err);
}
