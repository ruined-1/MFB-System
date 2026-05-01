import './server.js';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(`file://${filePath}`)).default;
    client.commands.set(command.data.name, command);
}

// Interaction handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
