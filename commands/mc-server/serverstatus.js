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

function printServerStatusResponse(statusObj){
    let responseStr = "";
    console.log(statusObj)
    responseStr += "`Machine Status`: " + statusObj.machineStatus + " " + StatusDiscordEmoji[statusObj.machineStatus];
    responseStr += "\n`Minecraft Server Status`: " + statusObj.mcServerStatus + " " + StatusDiscordEmoji[statusObj.mcServerStatus];
    if (statusObj.mcServerStatus == ServerStatus.ACTIVE) {
        responseStr += "\n`Currently Online:`";
        statusObj.mcServerPlayers.forEach(playerUname => responseStr += `\n\t- ${playerUname}`);
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

    var { stdout, stderr } = await exec_p(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);
    if (!stdout.includes("timed out")) {                // Machine is Up
        serverStatusObj.machineStatus = ServerStatus.ACTIVE;

        var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker container inspect -f '{{.State.Status}}, {{.State.Health}}' ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);
        if (stdout.includes("running") && stdout.includes("healthy")) {     // MC Server is up and running
            serverStatusObj.mcServerStatus = ServerStatus.ACTIVE;
            var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker exec ${process.env.GOOPCRAFT_CONTAINER_NAME} rcon-cli \"list\" | sed -e 's/\x1b\[[0-9;]*m//g' -e 's/^[0-9a-zA-Z ]*: '//g -e 's/ //g'"`);
            stdout.trim().split(",").forEach(player => serverStatusObj.mcServerPlayers.push(player));
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
}

export { data, execute };


