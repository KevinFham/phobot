import { Events, MessageFlags } from 'discord.js';

const name = Events.InteractionCreate;

const execute = async interaction => {
    if (!interaction.isChatInputCommand()) { console.log('Not a ChatInputCommand interaction. Returning.'); return; }

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) { console.error(`No command matching ${interaction.commandName} was found.`); return; }

    try {
        await command.execute(interaction);
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
