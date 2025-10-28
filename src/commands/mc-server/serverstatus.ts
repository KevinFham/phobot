import 'dotenv/config';
import type { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { SlashCommandBuilder, ContainerBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';
import type { ServerStatusObject } from '@/src/commands/mc-server/utils.js';
import { ServerStatus, StatusEmojiDict, ServerList } from '@/src/commands/mc-server/utils.js';
import { parseConfig } from '@/src/utils.js';
import * as mcServerApi from './api/mc-server-api.js';
import * as vpsApi from './api/vps-api.js';

const cfg = parseConfig();
const SERVER_STATUS_REFRESH_MS = cfg.msgRefreshRate.mcStatusRefreshInterval * 1000;
const STATUS_REFRESH_DURATION_MS = cfg.msgRefreshRate.mcStatusRefreshDuration * 1000;
const liveStatusDaemons: { [id: string]: { intervalID: ReturnType<typeof setInterval>, timeoutID: ReturnType<typeof setTimeout> } } = {};

function printOnlinePlayers( mcStat: ServerStatus, mcPlayers: string[] ) {
    let responseStr = "";
    if (mcStat == ServerStatus.ACTIVE) {
        if (mcPlayers.length > 0) {
            mcPlayers.forEach((playerUname: string) => responseStr += `\n> \`${playerUname}\``);
        } else {
            return "\n`No players connected.`";
        }
    }
    return responseStr;
}

async function getServerStatusObj( mcServerAlias: string ): Promise<ServerStatusObject> {
    var serverStatusObj: ServerStatusObject = {
        machineStatus: ServerStatus.UNKNOWN,
        mcServerStatus: ServerStatus.UNKNOWN,
        vpsStatus: ServerStatus.STOPPED,
        mcServerPlayers: [],
    }

    const res = await mcServerApi.getMinecraftServerStatus(mcServerAlias);
    if (res.serverStat.includes("down")) { 
        serverStatusObj.machineStatus = ServerStatus.STOPPED;
        serverStatusObj.mcServerStatus = ServerStatus.STOPPED;
    } else {
        serverStatusObj.machineStatus = ServerStatus.ACTIVE;

        if (res.serverStat.includes("running")) {
            serverStatusObj.mcServerStatus = ServerStatus.ACTIVE;
            serverStatusObj.mcServerPlayers = res.players;

        } else if (res.serverStat.includes("starting")) {
            serverStatusObj.mcServerStatus = ServerStatus.STARTING;

        } else if (res.serverStat.includes("error")) {
            serverStatusObj.mcServerStatus = ServerStatus.ERROR;

        } else if (res.serverStat.includes("exited")) {
            serverStatusObj.mcServerStatus = ServerStatus.STOPPED;
        } 
        //else, MC Server status unknown
    }

    const vpsRes = await vpsApi.getVpsStatus();
    if (vpsRes.code === 0) {
        serverStatusObj.vpsStatus = ServerStatus.ACTIVE;
    } else {
        serverStatusObj.vpsStatus = ServerStatus.STOPPED;
    }

    return serverStatusObj;
}

async function buildMcStatusContainer( mcServerAlias?: string, staleStatus: boolean = false): Promise<ContainerBuilder> {
    const serverList = ServerList.getList();
    if (serverList) {
        if (mcServerAlias) {
            const serverStatusObj = await getServerStatusObj(mcServerAlias);
            const serverData = ServerList.getDataFromAlias(mcServerAlias);

            return new ContainerBuilder()
                .setAccentColor(0x0099FF)
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent(`**Choose Server to see status:**`),
                )
                .addActionRowComponents(
                    actionRow => actionRow
                        .setComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('mcServerLiveStatusChoice')
                                .setPlaceholder('Choose a server...')
                                .addOptions(
                                    Array(Object.keys(serverList).length).fill(undefined).map((_, idx: number) => {
                                        const key: string | undefined = Object.keys(serverList)[idx];
                                        if (key) {
                                            const currentServerData = ServerList.getDataFromAlias(key);
                                            return new StringSelectMenuOptionBuilder()
                                                .setLabel(currentServerData!.name)
                                                .setDescription(currentServerData!.description)
                                                .setValue(key)
                                                .setDefault((key === mcServerAlias) ? true : false)
                                        } else {
                                            return new StringSelectMenuOptionBuilder().setLabel("Failed to fetch server").setValue("null")
                                        }
                                    })
                            ),
                        ),
                    )
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent(`**${serverData!.name} Server ${staleStatus ? "(STALE :electric_plug:)" : "(LIVE :satellite:)"} Status**`),
                )
                .addSeparatorComponents(separator => separator)
                .addSectionComponents(
                    section => section
                        .addTextDisplayComponents(
                            textDisplay => textDisplay
                                .setContent(`**Server IP**\n\`${serverData!.serverAddr}\` ${StatusEmojiDict[serverStatusObj.vpsStatus]} `),
                            textDisplay => textDisplay
                                .setContent("**Machine**\n" + serverStatusObj.machineStatus + "  " + StatusEmojiDict[serverStatusObj.machineStatus]),
                            textDisplay => textDisplay
                                .setContent("**Minecraft Server**\n" + serverStatusObj.mcServerStatus + "  " + StatusEmojiDict[serverStatusObj.mcServerStatus]),
                        )
                        .setThumbnailAccessory(
                            thumbnail => thumbnail
                                .setDescription('grass block')
                                .setURL('https://minecraft.wiki/images/Grass_Block_JE7_BE6.png')
                        ),
                )
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent("**Currently Online**" + printOnlinePlayers(serverStatusObj.mcServerStatus, serverStatusObj.mcServerPlayers)),
                );
        } else {
            return new ContainerBuilder()
                .setAccentColor(0x0099FF)
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent(`**Choose Server to see status:**`),
                )
                .addActionRowComponents(
                    actionRow => actionRow
                        .setComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('mcServerLiveStatusChoice')
                                .setPlaceholder('Choose a server...')
                                .addOptions(
                                    Array(Object.keys(serverList).length).fill(undefined).map((_, idx: number) => {
                                        const key: string | undefined = Object.keys(serverList)[idx];
                                        if (key) {
                                            const currentServerData = ServerList.getDataFromAlias(key);
                                            return new StringSelectMenuOptionBuilder()
                                                .setLabel(currentServerData!.name)
                                                .setDescription(currentServerData!.description)
                                                .setValue(key)
                                        } else {
                                            return new StringSelectMenuOptionBuilder().setLabel("Failed to fetch server").setValue("null")
                                        }
                                    })
                            ),
                        ),
                    )
        }
    } else {
        return new ContainerBuilder()
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent("Server list is **empty**!"),
            )
    }
}


const data = new SlashCommandBuilder()
                .setName('serverstatus')
                .setDescription('View the live status of the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        components: [await buildMcStatusContainer()],
        flags: MessageFlags.IsComponentsV2,
    });
}

async function stringSelectMenuRespond(interaction: StringSelectMenuInteraction) {

    // Kill any existing live status loops 
    if (interaction!.message.id in liveStatusDaemons) {
        clearInterval(liveStatusDaemons[interaction!.message.id]?.intervalID);
        clearTimeout(liveStatusDaemons[interaction!.message.id]?.timeoutID);
    }

    await interaction.deferUpdate();
    var refreshIntervalID = setInterval(async () => {
        await interaction.editReply({
            components: [await buildMcStatusContainer(interaction.values[0])],
            flags: MessageFlags.IsComponentsV2,
        });
    }, SERVER_STATUS_REFRESH_MS);

    var timeoutID = setTimeout(async () => { 
        clearInterval(refreshIntervalID); 
        delete liveStatusDaemons[interaction!.message.id]; 
        await interaction.editReply({
             components: [await buildMcStatusContainer(interaction.values[0], true)],
             flags: MessageFlags.IsComponentsV2,
         });
    }, STATUS_REFRESH_DURATION_MS);

    // Track live status loop
    liveStatusDaemons[interaction!.message.id] = { intervalID: refreshIntervalID, timeoutID: timeoutID };
}

export { data, execute, stringSelectMenuRespond };


