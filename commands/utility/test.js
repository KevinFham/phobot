import { SlashCommandBuilder, ContainerBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags, ButtonStyle } from 'discord.js';

const data = new SlashCommandBuilder()
                .setName('test')
                .setDescription('display container')
                .setIntegrationTypes([ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ])
                .setContexts([ InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel ]);

async function execute (interaction) {
    const container = new ContainerBuilder()
        .setAccentColor(0x0099FF)
        .addTextDisplayComponents(
            textDisplay => textDisplay
                .setContent('Text Display Content'),
        )
        .addSeparatorComponents(separator => separator)
        .addSectionComponents(
            section => section
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent('Subsection 1 Text Display'),
                    textDisplay => textDisplay
                        .setContent('Subsection 2 Text Display'),
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail
                        .setDescription('alt text')
                        .setURL('https://i.pinimg.com/736x/6e/da/25/6eda251c8069ca80231fac522127bbf4.jpg')
                ),
        );


    await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

export { data, execute };
