import { Events } from 'discord.js';

const name = Events.MessageCreate;

const execute = message => {
    if (message.content === "e"){
        message.reply("kys");
    }
}

export { name, execute }
