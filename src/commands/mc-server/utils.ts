import { parseConfig } from '@/src/utils.js';
import { ContainerBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'

const cfg = parseConfig();

export interface ServerStatusObject {
    machineStatus: ServerStatus,
    mcServerStatus: ServerStatus,
    vpsStatus: ServerStatus,
    mcServerPlayers: string[],
};

export interface ServerListEntry {
    name: string,
    description: string,
    serverAddr: string,
}

export interface ServerList {
    [id: string]: ServerListEntry
}

export enum ServerStatus {
    STOPPED = "STOPPED",
    STARTING = "STARTING",
    ACTIVE = "ACTIVE",
    UNKNOWN = "UNKNOWN",
    ERROR = "ERROR",
};

export const StatusEmojiDict = {
    "STOPPED": ":no_entry:",
    "STARTING": ":stopwatch:",
    "ACTIVE": ":white_check_mark:",
    "UNKNOWN": ":question:",
    "ERROR": ":no_entry_sign:",
};

//export function typedKeys<T>(o: T): (keyof T)[] {
//    return Object.keys(o) as (keyof T)[];
//}

export namespace ServerList {
    const serverList: ServerList = Object.assign({}, ...cfg.mcServer.mcServerAliases.map((key: string) => ({[key]: {
        name: cfg.mcServer.mcServerSelections[cfg.mcServer.mcServerAliases.indexOf(key)],
        description: cfg.mcServer.mcServerSelectionDescs[cfg.mcServer.mcServerAliases.indexOf(key)],
        serverAddr: cfg.mcServer.mcServerAddrs[cfg.mcServer.mcServerAliases.indexOf(key)]
    }}))) as ServerList;

    export function getList(): ServerList {
        return serverList;
    }
    export function getDataFromAlias( mcServerAlias?: string ): ServerListEntry | undefined {
        if (mcServerAlias) { return serverList[mcServerAlias]; }
        else { return { name: "Null", description: "No alias provided", serverAddr: "null" }; }
    }
}

export async function buildMcServerSelectContainer( promptMsg?: string ): Promise<ContainerBuilder> {
    const serverList = ServerList.getList();
    if (serverList) {
        return new ContainerBuilder()
                .setAccentColor(0x0099FF)
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent(promptMsg ? promptMsg : `**Choose a server:**`),
                )
                .addActionRowComponents(
                    actionRow => actionRow
                        .setComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('mcServerSelectChoice')
                                .setPlaceholder('Choose a server...')
                                .addOptions(
                                    Array(Object.keys(serverList).length).fill(undefined).map((_, idx: number) => {
                                        const key: string | undefined = Object.keys(serverList)[idx];
                                        if (key) {
                                            return new StringSelectMenuOptionBuilder()
                                                .setLabel(serverList[key]!.name)
                                                .setDescription(serverList[key]!.description)
                                                .setValue(key)
                                        } else {
                                            return new StringSelectMenuOptionBuilder().setLabel("Failed to fetch server").setValue("null")
                                        }
                                    })
                            ),
                        ),
                    )
    } else {
        return new ContainerBuilder()
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent("Server list is **empty**!"),
            )
    }

}

export function buildResponseContainer( msg: string ): ContainerBuilder {
    return new ContainerBuilder()
        .setAccentColor(0x0099FF)
        .addTextDisplayComponents(
            textDisplay => textDisplay
                .setContent(msg),
        )

}
