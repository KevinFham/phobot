import 'dotenv/config';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { exec_p } from '../../utils.js';

const data = new SlashCommandBuilder()
                .setName('serverstart')
                .setDescription('Start the server machine.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    var { stdout, stderr } = await exec_p(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);
    if (!stdout.includes("timed out")) {
        await interaction.reply('The machine is already online! View status using `/serverstatus`');
    } else {
        var { stdout, stderr } = await exec_p(`wakeonlan ${process.env.SERVER_MAC_ADDR}`);
        await interaction.reply('Starting machine! View status using `/serverstatus`');
    }
}

export { data, execute };


