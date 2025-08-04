import 'dotenv/config';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
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

function printServerStatusResponse(statusObj){
    let responseStr = "";
    responseStr += "`Machine Status`: " + statusObj.machineStatus + " " + StatusDiscordEmoji[statusObj.machineStatus];
    responseStr += "\n`Minecraft Server Status`: " + statusObj.mcServerStatus + " " + StatusDiscordEmoji[statusObj.mcServerStatus];
    if (statusObj.mcServerStatus == ServerStatus.ACTIVE) {
        responseStr += "\n`Currently Online:`";
        if (statusObj.mcServerPlayers.length > 0) {
            statusObj.mcServerPlayers.forEach(playerUname => responseStr += `\n> ${playerUname}`);
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

    var refreshIntervalID = setInterval(async () => {

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

        await interaction.editReply(printServerStatusResponse(serverStatusObj));

    }, SERVER_STATUS_REFRESH_MS);

    setTimeout(() => { clearInterval(refreshIntervalID); }, STATUS_REFRESH_DURATION_MS);
}

export { data, execute };


