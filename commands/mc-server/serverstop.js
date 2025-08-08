import 'dotenv/config';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { exec_p, parseConfig } from '../../utils.js';

const data = new SlashCommandBuilder()
                .setName('serverstop')
                .setDescription('Stop the minecraft server, as long as the server is currently empty')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    var { stdout, stderr } = await exec_p(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);

    // Machine is up
    if (!stdout.includes("timed out")) {
        var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker container inspect -f '{{.State.Status}}, {{.State.Health}}' ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);

        if (stdout.includes("running") && stdout.includes("healthy")) {     // MC Server is up and running
            var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker exec ${process.env.GOOPCRAFT_CONTAINER_NAME} rcon-cli \"list\" | sed -e 's/\x1b\[[0-9;]*m//g' -e 's/^[0-9a-zA-Z ]*: '//g -e 's/ //g'"`);
            var currentlyOnline = stdout.trim().split(",").filter(x => x);
            if (!currentlyOnline.length > 0) {
                var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker exec ${process.env.GOOPCRAFT_CONTAINER_NAME} rcon-cli \"stop\""`);
                await interaction.reply (`Minecraft server **shutting down**...`);
            }
            else {
                await interaction.reply(`**${currentlyOnline.length}** players online! Aborting shutdown.`);
            }

        } else if (stdout.includes("starting")) {                           // MC Server is booting up
            await interaction.reply('Minecraft server is **starting up**! Please wait until the server is fully up and running.');

        } else if (stdout.includes("exited")) {                             // MC Server is shut down
            var { stdout, stderr } = await exec_p(`ssh -t root@${process.env.SERVER_IP_ADDR} "docker start ${process.env.GOOPCRAFT_CONTAINER_NAME}"`);
            await interaction.reply('Minecraft server is already **shut down**!');

        } else { //else, MC Server status unknown
            await interaction.reply('Something went wrong when trying to find the minecraft server!');

        }

    // Machine is down
    } else {
        await interaction.reply('Machine is not on and neither is the minecraft server!');
    }
}

export { data, execute };


