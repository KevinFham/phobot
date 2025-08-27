import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';

const data = new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Replies with Pong!')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
}

export { data, execute };
