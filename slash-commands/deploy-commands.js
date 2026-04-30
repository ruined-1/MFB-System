import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";

const CLIENT_ID = "1490173403032977519";
const GUILD_ID = "1139943473437495457";
const TOKEN = process.env.TOKEN;

const commands = [];

const commandsPath = path.join(process.cwd(), "slash-commands");
const files = fs.readdirSync(commandsPath);

for (const file of files) {
  const filePath = path.join(commandsPath, file);
  const commandData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  commands.push(commandData);
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Deploying slash commands…");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Slash commands deployed.");
  } catch (err) {
    console.error(err);
  }
})();
