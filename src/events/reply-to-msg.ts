import type { Message } from 'discord.js';
import { Events } from 'discord.js';

const name = Events.MessageCreate;

const execute = (message: Message) => {
    if (message.content === "e"){
        message.reply("kys");
    }
}

export { name, execute }
