import type { Client } from 'discord.js';
import { Events, PresenceUpdateStatus } from 'discord.js';

const name = Events.ClientReady;
const once = true;
const execute = (client: Client) => {
    if (client.user) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setPresence({ activities: [{ name: 'doing your mom'}], status: PresenceUpdateStatus.Online });
    } else {
        console.log("Discord.js client has no user!");
    }
}

export { name, once, execute }
