import 'dotenv/config';
import type { UserContextMenuCommandInteraction } from 'discord.js';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import * as mcServerApi from './api/mc-server-api.js';
import * as vpsApi from './api/vps-api.js';

const data = new SlashCommandBuilder()
                .setName('serverstop')
                .setDescription('Stop the minecraft server, as long as the server is currently empty')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction: UserContextMenuCommandInteraction) {
    const res = await mcServerApi.stopMinecraftServer();
    res.message.replace("starting up", "**starting up**");
    res.message.replace("shut down", "**shut down**");
    res.message.replace("shutting down", "**shutting down**");

    if ( res.code === 0 ) {
        await vpsApi.stopVps();
    }

    await interaction.reply(res.message);
}

export { data, execute };


