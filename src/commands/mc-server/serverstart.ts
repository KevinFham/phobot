import 'dotenv/config';
import type { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { parseConfig } from '@/src/utils.js';
import * as mcServerApi from './api/mc-server-api.js';
import * as vpsApi from './api/vps-api.js';

const cfg = parseConfig();
const START_PING_DELAY = cfg.mcServer.serverStart.delay * 1000;
const START_PING_INTERVAL_MS = cfg.mcServer.serverStart.mcStartPingInterval * 1000;
const START_PING_DURATION_MS = cfg.mcServer.serverStart.mcStartPingDuration * 1000;

const data = new SlashCommandBuilder()
                .setName('serverstart')
                .setDescription('Start the minecraft server.')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute(interaction: ChatInputCommandInteraction) {
    const res = await mcServerApi.startMinecraftServer('goopcraft');
    if (res.message.includes("Server is down because machine is down")) {
        await mcServerApi.startMachine();
        await vpsApi.startVps();
        await interaction.reply('Starting machine! View status using `/serverstatus`');

        setTimeout(() => {}, START_PING_DELAY);
        var timeoutID: ReturnType<typeof setTimeout> | undefined;

        // Repeatedly ping machine until mc server becomes accessible
        const refreshIntervalID = setInterval(async () => {
            const status = await mcServerApi.getMachineStatus();
            if (status.code === 0) {
                await mcServerApi.startMinecraftServer('goopcraft');
                await interaction.followUp('Starting minecraft server!');
                clearInterval(refreshIntervalID);
                if (timeoutID) { clearTimeout(timeoutID); }
            }
        }, START_PING_INTERVAL_MS);

        // Timeout response
        timeoutID = setTimeout(async () => {
            timeoutID = undefined;
            await interaction.followUp(`Minecraft server startup sequence timed out! Run \`/serverstart\` again or join the server at \`${cfg.mcServer.mcServerAddr}\` to start it up manually.`);
            clearInterval(refreshIntervalID);
        }, START_PING_DURATION_MS);

    } else {
        res.message.replace("online", "**online**");
        res.message.replace("starting up", "**starting up**");

        if ( res.code === 0 ) {
            await vpsApi.startVps();
        }

        await interaction.reply(res.message + " View status using `/serverstatus`");
    }

}

async function stringSelectMenuRespond(interaction: StringSelectMenuInteraction) {
    console.log('made it');
    interaction.reply("test");
}

export { data, execute, stringSelectMenuRespond };


