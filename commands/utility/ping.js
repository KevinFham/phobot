import { SlashCommandBuilder } from 'discord.js';

//export {
//    data: new SlashCommandBuilder()
//        .setName('ping')
//        .setDescription('Replies with Pong!') },
//    async execute(interaction) {
//        await interaction.reply('Pong!');
//    },
//};

const data = new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Replies with Pong!');
export data
