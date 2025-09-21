import 'dotenv/config';
import type { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';
import type { ServerListEntry } from '@/src/commands/mc-server/utils.js';
import { ServerList, buildMcServerSelectContainer, buildResponseContainer } from '@/src/commands/mc-server/utils.js';
import { parseConfig } from '@/src/utils.js';
import * as mcServerApi from './api/mc-server-api.js';
import * as vpsApi from './api/vps-api.js';

const cfg = parseConfig();
const START_PING_DELAY = cfg.mcServer.serverStart.delay * 1000;
const START_PING_INTERVAL_MS = cfg.mcServer.serverStart.mcStartPingInterval * 1000;
const START_PING_DURATION_MS = cfg.mcServer.serverStart.mcStartPingDuration * 1000;


const data = new SlashCommandBuilder()
                .setName('serverstart')
                .setDescription('Start the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        components: [await buildMcServerSelectContainer(`**Choose a server to start:**`)],
        flags: MessageFlags.IsComponentsV2,
    });
}

async function stringSelectMenuRespond(interaction: StringSelectMenuInteraction) {
    const serverData: ServerListEntry | undefined = ServerList.getDataFromAlias(interaction.values[0]);
    const res = await mcServerApi.startMinecraftServer(interaction.values[0]);
    if (res.message.includes("Minecraft server is down because machine is down")) {
        await mcServerApi.startMachine();
        await vpsApi.startVps();
        await interaction.update({
            components: [await buildResponseContainer('Starting machine! View status using `/serverstatus`')],
            flags: MessageFlags.IsComponentsV2,
        });

        setTimeout(() => {}, START_PING_DELAY);
        var timeoutID: ReturnType<typeof setTimeout> | undefined;

        // Repeatedly ping machine until mc server becomes accessible
        const refreshIntervalID = setInterval(async () => {
            const status = await mcServerApi.getMachineStatus();
            if (status.code === 0) {
                await mcServerApi.startMinecraftServer(interaction.values[0]);
                await interaction.followUp({
                    components: [await buildResponseContainer(`Starting the \`${serverData!.name}\` minecraft server!`)],
                    flags: MessageFlags.IsComponentsV2,
                });
                clearInterval(refreshIntervalID);
                if (timeoutID) { clearTimeout(timeoutID); }
            }
        }, START_PING_INTERVAL_MS);

        // Timeout response
        timeoutID = setTimeout(async () => {
            timeoutID = undefined;
            await interaction.followUp({
                components: [await buildResponseContainer(`Minecraft server startup sequence timed out! Run \`/serverstart\` again or join the server at \`${serverData!.serverAddr}\` to start it up manually.`)],
                flags: MessageFlags.IsComponentsV2,
            });
            clearInterval(refreshIntervalID);
        }, START_PING_DURATION_MS);
    } else {
        res.message.replace("online", "**online**");
        res.message.replace("starting up", "**starting up**");
        res.message.replace("Minecraft server", `\`${serverData!.name}\` minecraft server`);

        if ( res.code === 0 ) {
            await vpsApi.startVps();
        }

        await interaction.update({
            components: [await buildResponseContainer(res.message + " View status using `/serverstatus`")],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}

export { data, execute, stringSelectMenuRespond };


