import 'dotenv/config';
const util = await import('node:util');
import { exec } from 'child_process';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';

const data = new SlashCommandBuilder()
                .setName('serverstatus')
                .setDescription('View the status of the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    //const { stdout, stderr } = await util.promisify(exec)(`fping -c1 -t600 ${process.env.SERVER_IP_ADDR}`);
    //console.log(`${stdout}\n---------\n${stderr}`);
}

export { data, execute };


