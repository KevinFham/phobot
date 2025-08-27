import 'dotenv/config';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder, ContainerBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';
import { parseConfig } from '@/src/utils.js'
import * as mcServerApi from './api/mc-server-api.js';
import * as vpsApi from './api/vps-api.js';

const cfg = parseConfig();
const SERVER_STATUS_REFRESH_MS = cfg.msgRefreshRate.mcStatusRefreshInterval * 1000;
const STATUS_REFRESH_DURATION_MS = cfg.msgRefreshRate.mcStatusRefreshDuration * 1000;

enum ServerStatus {
    STOPPED = "STOPPED",
    STARTING = "STARTING",
    ACTIVE = "ACTIVE",
    UNKNOWN = "UNKNOWN",
    ERROR = "ERROR",
};

const StatusDiscordEmoji = {
    "STOPPED": ":no_entry:",
    "STARTING": ":stopwatch:",
    "ACTIVE": ":white_check_mark:",
    "UNKNOWN": ":question:",
    "ERROR": ":no_entry_sign:",
}

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


const data = new SlashCommandBuilder()
                .setName('serverstatus')
                .setDescription('View the live status of the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction: ChatInputCommandInteraction) {
    var serverStatusObj: {
        machineStatus: ServerStatus,
        mcServerStatus: ServerStatus,
        vpsStatus: ServerStatus,
        mcServerPlayers: string[],
    } = {
        machineStatus: ServerStatus.UNKNOWN,
        mcServerStatus: ServerStatus.UNKNOWN,
        vpsStatus: ServerStatus.STOPPED,
        mcServerPlayers: [],
    }

    await interaction.deferReply();

    // Update response in a loop
    var refreshIntervalID = setInterval(async () => {

        // Info gather
        const res = await mcServerApi.getMinecraftServerStatus();
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
            serverStatusObj.vpsStatus = ServerStatus.STARTING;
        } else {
            serverStatusObj.vpsStatus = ServerStatus.STOPPED;
        }

        // Build and send container
        const container = new ContainerBuilder()
            .setAccentColor(0x0099FF)
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent(`**Goopcraft Server LIVE Status**`),
            )
            .addSeparatorComponents(separator => separator)
            .addSectionComponents(
                section => section
                    .addTextDisplayComponents(
                        textDisplay => textDisplay
                            .setContent(`**Server IP**\n\`${cfg.mcServer.mcServerAddr}\` ${StatusDiscordEmoji[serverStatusObj.vpsStatus]} `),
                        textDisplay => textDisplay
                            .setContent("**Machine**\n" + serverStatusObj.machineStatus + "  " + StatusDiscordEmoji[serverStatusObj.machineStatus]),
                        textDisplay => textDisplay
                            .setContent("**Minecraft Server**\n" + serverStatusObj.mcServerStatus + "  " + StatusDiscordEmoji[serverStatusObj.mcServerStatus]),
                    )
                    .setThumbnailAccessory(
                        thumbnail => thumbnail
                            .setDescription('two black dudes kissing')
                            .setURL('https://i.pinimg.com/736x/6e/da/25/6eda251c8069ca80231fac522127bbf4.jpg')
                    ),
            )
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent("**Currently Online**" + printOnlinePlayers(serverStatusObj.mcServerStatus, serverStatusObj.mcServerPlayers)),
            );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });

    }, SERVER_STATUS_REFRESH_MS);

    setTimeout(() => { clearInterval(refreshIntervalID); }, STATUS_REFRESH_DURATION_MS);
}

export { data, execute };


