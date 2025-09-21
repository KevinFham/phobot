import type { CommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { Events, MessageFlags } from 'discord.js';
import type { PhobotClient } from '@/src/PhobotClient.js';

const name = Events.InteractionCreate;

const execute = async (interaction: CommandInteraction) => {

    const phobotClient = interaction.client as PhobotClient
    
    if (interaction.isChatInputCommand()) {
        const command = (phobotClient as PhobotClient).commands.get(interaction.commandName) as { data: string, execute: Function };
        if (!command) { console.error(`No command matching ${interaction.commandName} was found.`); return; }

        try {
            if ('execute' in command) {
                await command.execute(interaction);
            } else {
                console.log('No "execute" property found in command');
            }
        } catch (e) {
            console.error(e);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    }

    //else if (interaction.isButton()) {
    //}

    else if (interaction.isStringSelectMenu()) {
        const ssmInteraction = interaction as StringSelectMenuInteraction
        const cmdInteraction = ssmInteraction!.message.interaction;
        const command = phobotClient.commands.get(cmdInteraction?.commandName) as { data: string, stringSelectMenuRespond: Function };
        if (!command) { console.error(`No command matching ${cmdInteraction?.commandName} was found`); return; }

        try {
             if ('stringSelectMenuRespond' in command) {
                 await command.stringSelectMenuRespond(ssmInteraction);
             } else {
                 console.log('No "stringSelectMenuRespond" property found in command');
             }
         } catch (e) {
             console.error(e);
             if (ssmInteraction.replied || ssmInteraction.deferred) {
                 await ssmInteraction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
             } else {
                 await ssmInteraction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
             }
         }

    }

    else {
        console.log(interaction);
        interaction.reply('Interaction not recognized');
    }

}

export { name, execute }
