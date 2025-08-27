import 'dotenv/config';
import { fileURLToPath } from 'url';
const fs = await import('node:fs');
const path = await import('node:path');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { GatewayIntentBits } from 'discord.js';
import { PhobotClient } from './PhobotClient.js';

const FILE_EXTENSION = (process.env['NODE_ENV'] == 'development') ? '.ts' : '.js';

const required = [];
if (!process.env['APP_ID']) { required.push('APP_ID'); }
if (!process.env['DISCORD_TOKEN']) { required.push('DISCORD_TOKEN'); }
if (!process.env['PUBLIC_KEY']) { required.push('PUBLIC_KEY'); }
if (required.length > 0) {
    console.log('Missing Env variables for: ');
    required.forEach(e => console.log(`- ${e}`))
    process.exit(1);
}

const client = new PhobotClient({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
] });


// Load Commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(FILE_EXTENSION));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`);
        }
    }
}

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(FILE_EXTENSION));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = await import(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Bot Login
client.login(process.env['DISCORD_TOKEN']);
