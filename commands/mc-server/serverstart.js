import 'dotenv/config';
import { exec } from 'child_process';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';

const data = new SlashCommandBuilder()
                .setName('serverstart')
                .setDescription('Start the server machine.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    exec(`wakeonlan ${process.env.SERVER_MAC_ADDR}`, async (err, stdout, stderr) => {
        if (err) { console.error(err); let _ = await interaction.reply('There was an error while executing this command!'); }
		else if (stderr) { console.error(`[STDERR]: ${stderr}`); let _ = await interaction.reply('There was an error while executing this command!'); }
        else {
            await interaction.reply('Starting machine! View the status of the server with `/serverstatus` (not yet implemented)');
        }
    });
}

export { data, execute };


