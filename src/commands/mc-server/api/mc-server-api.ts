import { parseConfig } from '@/src/utils.js';

const cfg = parseConfig();

export interface GenericServerResponse {
    code: number,
    message: string
};
export interface MinecraftServerStatusResponse extends GenericServerResponse {
    serverStat: string,
    players: string[],
};

export async function startMachine(): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/machine?machineHostname=${cfg.mcServer.mcServerHostname}`, {
                method: 'PUT', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'startMachine' }),
            });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as GenericServerResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

export async function getMachineStatus(): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/machine?machineHostname=${cfg.mcServer.mcServerHostname}`, { method: 'GET' });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as GenericServerResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

export async function getMinecraftServerList(): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server/serverlist`, { method: 'GET' });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as GenericServerResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

export async function startMinecraftServer(mcServerAlias?: string): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server?mcInstance=${mcServerAlias}`, {
                method: 'PUT', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'startMinecraftServer' }),
            });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as GenericServerResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

export async function getMinecraftServerStatus(mcServerAlias?: string): Promise<MinecraftServerStatusResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server?mcInstance=${mcServerAlias}`, { method: 'GET' });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as MinecraftServerStatusResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

export async function stopMinecraftServer(mcServerAlias?: string): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server?mcInstance=${mcServerAlias}`, {
                method: 'PUT', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'stopMinecraftServer' }),
            });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as GenericServerResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

