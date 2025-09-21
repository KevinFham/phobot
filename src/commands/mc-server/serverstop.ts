import 'dotenv/config';
import type { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';
import { ServerList, buildMcServerSelectContainer, buildResponseContainer } from '@/src/commands/mc-server/utils.js';
import * as mcServerApi from './api/mc-server-api.js';
//import * as vpsApi from './api/vps-api.js';

const data = new SlashCommandBuilder()
                .setName('serverstop')
                .setDescription('Stop the minecraft server, as long as the server is currently empty')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        components: [await buildMcServerSelectContainer(`**Choose a server to stop:**`)],
        flags: MessageFlags.IsComponentsV2,
    });
}

async function stringSelectMenuRespond(interaction: StringSelectMenuInteraction) {
    const serverData = ServerList.getDataFromAlias(interaction.values[0]);
    const res = await mcServerApi.stopMinecraftServer(interaction.values[0]);
    res.message.replace("starting up", "**starting up**");
    res.message.replace("shut down", "**shut down**");
    res.message.replace("shutting down", "**shutting down**");
    res.message.replace("Minecraft server", `\`${serverData!.name}\` minecraft server`);

    await interaction.update({
        components: [await buildResponseContainer(res.message)],
        flags: MessageFlags.IsComponentsV2,
    });
}

export { data, execute, stringSelectMenuRespond };
