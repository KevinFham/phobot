import type { CommandInteraction } from 'discord.js';
import { Events, MessageFlags } from 'discord.js';
import type { PhobotClient } from '@/src/PhobotClient.js';

const name = Events.InteractionCreate;

const execute = async (interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) { console.log('Not a ChatInputCommand interaction. Returning.'); return; }

    const phobotClient = interaction.client
    const command = (phobotClient as PhobotClient).commands.get(interaction.commandName);
    if (!command) { console.error(`No command matching ${interaction.commandName} was found.`); return; }

    try {
        if (command && 'execute' in command) {
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

export { name, execute }
