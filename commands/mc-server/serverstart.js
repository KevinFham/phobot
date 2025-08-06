import 'dotenv/config';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { exec_p, parseConfig } from '../../utils.js';

const cfg = parseConfig();
const START_PING_DELAY = cfg.serverStart.delay * 1000;
const START_PING_INTERVAL_MS = cfg.serverStart.mcStartPingInterval * 1000;
const START_PING_DURATION_MS = cfg.serverStart.mcStartPingDuration * 1000;

const data = new SlashCommandBuilder()
                .setName('serverstart')
                .setDescription('Start the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    var { stdout, stderr } = await exec_p(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);

    // Machine is up
    if (!stdout.includes("timed out")) {
        var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker container inspect -f '{{.State.Status}}, {{.State.Health}}' ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);

        if (stdout.includes("running") && stdout.includes("healthy")) {     // MC Server is up and running
            await interaction.reply('Minecraft server is already **online**! View status using `/serverstatus`');

        } else if (stdout.includes("starting")) {                           // MC Server is booting up
            await interaction.reply('Minecraft server is **starting up**! View status using `/serverstatus`');

        } else if (stdout.includes("exited")) {                             // MC Server is shut down
            var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker start ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);
            await interaction.reply('Starting minecraft server! View status using `/serverstatus`');

        } else { //else, MC Server status unknown
            await interaction.reply('Something went wrong when trying to find the minecraft server!');

        }

    // Machine is down
    } else {
        var { stdout, stderr } = await exec_p(`wakeonlan ${process.env.SERVER_MAC_ADDR}`);
        await interaction.reply('Starting machine! View status using `/serverstatus`');

        setTimeout(() => {}, START_PING_DELAY);
        var timeoutID;

        // Repeatedly ping machine until mc server becomes accessible
        const refreshIntervalID = setInterval(async () => {
            var { stdout, stderr } = await exec_p(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);
            if (!stdout.includes("timed out")) {
                var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker start ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);
                await interaction.followUp('Starting minecraft server!');
                clearInterval(refreshIntervalID);
                clearTimeout(timeoutID);
            }
        }, START_PING_INTERVAL_MS);

        // Timeout response
        timeoutID = setTimeout(async () => {
            await interaction.followUp(`Minecraft server startup sequence timed out! Run \`/serverstart\` again or join the server at \`${process.env.GOOPCRAFT_SERVER_ADDR}\` to start it up manually.`);
            clearInterval(refreshIntervalID);
        }, START_PING_DURATION_MS);
    }
}

export { data, execute };


