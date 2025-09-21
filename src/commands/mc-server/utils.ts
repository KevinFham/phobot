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

export interface ServerStatusObject {
    machineStatus: ServerStatus,
    mcServerStatus: ServerStatus,
    vpsStatus: ServerStatus,
    mcServerPlayers: string[],
};
