import { Events, PresenceUpdateStatus } from 'discord.js';

const name = Events.ClientReady;
const once = true;
const execute = client => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: 'doing your mom'}], status: PresenceUpdateStatus.Online });
}

export { name, once, execute }
