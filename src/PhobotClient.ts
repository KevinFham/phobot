import { Client, Collection } from 'discord.js';

export class PhobotClient extends Client {
    commands = new Collection();
}
