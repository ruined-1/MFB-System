import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// CHANGE THIS to your server ID
const GUILD_ID = '1139943473437495457';

async function wipeCommands() {
    try {
        console.log('Wiping GLOBAL commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('✔ Global commands wiped.');

        console.log('Wiping GUILD commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
            { body: [] }
        );
        console.log('✔ Guild commands wiped.');

        console.log('All commands removed successfully.');
    } catch (error) {
        console.error(error);
    }
}

wipeCommands();
