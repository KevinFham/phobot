import 'dotenv/config';
import { SlashCommandBuilder, ContainerBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags } from 'discord.js';
import { exec_p } from '../../utils.js'

const ServerStatus = {
    STOPPED: "STOPPED",
    STARTING: "STARTING",
    ACTIVE: "ACTIVE",
    UNKNOWN: "UNKNOWN",
};

const StatusDiscordEmoji = {
    "STOPPED": ":no_entry:",
    "STARTING": ":stopwatch:",
    "ACTIVE": ":white_check_mark:",
    "UNKNOWN": ":question:"
}

const SERVER_STATUS_REFRESH_MS = 2 * 1000;
const STATUS_REFRESH_DURATION_MS = 5 * 60 * 1000;

function printOnlinePlayers(statusObj){
    let responseStr = "";
    if (statusObj.mcServerStatus == ServerStatus.ACTIVE) {
        if (statusObj.mcServerPlayers.length > 0) {
            statusObj.mcServerPlayers.forEach(playerUname => responseStr += `\n> \`${playerUname}\``);
        } else {
            return "\n`No players connected.`";
        }
    }
    return responseStr;
}

const data = new SlashCommandBuilder()
                .setName('serverstatus')
                .setDescription('View the status of the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    var serverStatusObj = {
        machineStatus: ServerStatus.UNKNOWN,
        mcServerStatus: ServerStatus.UNKNOWN,
        mcServerPlayers: [],
    }

    interaction.deferReply();

    // Update response in a loop
    var refreshIntervalID = setInterval(async () => {

        // Info gather
        var { stdout, stderr } = await exec_p(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);
        if (!stdout.includes("timed out")) {                // Machine is Up
            serverStatusObj.machineStatus = ServerStatus.ACTIVE;

            var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker container inspect -f '{{.State.Status}}, {{.State.Health}}' ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);
            if (stdout.includes("running") && stdout.includes("healthy")) {     // MC Server is up and running
                serverStatusObj.mcServerStatus = ServerStatus.ACTIVE;
                var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker exec ${process.env.GOOPCRAFT_CONTAINER_NAME} rcon-cli \"list\" | sed -e 's/\x1b\[[0-9;]*m//g' -e 's/^[0-9a-zA-Z ]*: '//g -e 's/ //g'"`);
                serverStatusObj.mcServerPlayers = stdout.trim().split(",").filter(x => x);
            } else if (stdout.includes("starting")) {                           // MC Server is booting up
                serverStatusObj.mcServerStatus = ServerStatus.STARTING;
            } else if (stdout.includes("exited")) {                             // MC Server is shut down
                serverStatusObj.mcServerStatus = ServerStatus.STOPPED;
            } //else, MC Server status unknown

        } else if (stdout.includes("timed out")) {          // Machine is Down
            serverStatusObj.machineStatus = ServerStatus.STOPPED;
            serverStatusObj.mcServerStatus = ServerStatus.STOPPED;
        }

        // Build and send container
        const container = new ContainerBuilder()
            .setAccentColor(0x0099FF)
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent(`**Goopcraft Server Status**`),
            )
            .addSeparatorComponents(separator => separator)
            .addSectionComponents(
                section => section
                    .addTextDisplayComponents(
                        textDisplay => textDisplay
                            .setContent(`**Server IP**\n\`${process.env.GOOPCRAFT_SERVER_ADDR}\``),
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
                    .setContent("**Currently Online**" + printOnlinePlayers(serverStatusObj)),
            );
        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });

    }, SERVER_STATUS_REFRESH_MS);

    setTimeout(() => { clearInterval(refreshIntervalID); }, STATUS_REFRESH_DURATION_MS);
}

export { data, execute };


