import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';

const data = new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Replies with Pong!')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild ]);

const execute = async interaction => {
    await interaction.reply('Pong!');
}

export { data, execute };
