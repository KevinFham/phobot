import 'dotenv/config';
import { fileURLToPath } from 'url';
const fs = await import('node:fs');
const path = await import('node:path');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';


// Discord Bot Logon
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
//client.once(Events.ClientReady, readyClient => {
//    console.log(`Phobot ready! Logged in as ${readyClient.user.tag}`);
//});


// Load Commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
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
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = await import(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.DISCORD_TOKEN);

//Handle Command Interactions
//client.on(Events.InteractionCreate, async interaction => {
//    console.log(interaction);
//    if (!interaction.isChatInputCommand()) { console.log('Not a ChatInputCommand interaction. Returning.'); return; }
//
//    const command = interaction.client.commands.get(interaction.commandName);
//    if (!command) { console.error(`No command matching ${interaction.commandName} was found.`); return; }
//
//    try {
//        await command.execute(interaction);
//    } catch (e) {
//        console.error(e);
//        if (interaction.replied || interaction.deferred) {
//            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
//        } else {
//            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
//        }
//    }
//});
