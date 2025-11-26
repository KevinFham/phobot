import 'dotenv/config';
import { fileURLToPath } from 'url';
const fs = await import('node:fs');
const path = await import('node:path');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { REST, Routes } from 'discord.js';

const GLOBAL_DEPLOY = process.argv.includes("--global");

if (!process.env['APP_ID']) { console.log('Missing Env variable for APP_ID'); process.exit(0); }
if (!process.env['DISCORD_TOKEN']) { console.log('Missing Env variable for DISCORD_TOKEN'); process.exit(0); }
if (!process.env['DISCORD_SERVER_ID']) { console.log('Missing Env variable for DISCORD_SERVER_ID'); process.exit(0); }


const deploymentRoute = GLOBAL_DEPLOY ?
            Routes.applicationCommands(process.env['APP_ID']) : Routes.applicationGuildCommands(process.env['APP_ID'], process.env['DISCORD_SERVER_ID']);

// Gather All Commands from commands/ folder
const commands = [];
const foldersPath = path.join(__dirname, '/src/commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Send these commands to Discord and register them to the bot
const rest = new REST().setToken(process.env['DISCORD_TOKEN']);

(async () => {
    try {
        console.log(`Refreshing ${commands.length} application (/) commands...`);
        commands.forEach(cmd => console.log(`- ${cmd.name}`));
        const data = await rest.put(
            deploymentRoute,
            { body: commands },
        ) as Object;
        if (data && 'length' in data) {
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } else {
            console.log('Something went wrong when loading commands');
        }
    } catch (e) {
        console.error(e);
    }
})();
