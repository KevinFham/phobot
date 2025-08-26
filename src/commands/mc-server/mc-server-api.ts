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
    return new Promise( async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
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
    return new Promise( async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'getMachineStatus' }),
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

export async function startMinecraftServer(): Promise<GenericServerResponse> {
    return new Promise( async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
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

export async function getMinecraftServerStatus(): Promise<MinecraftServerStatusResponse> {
    return new Promise( async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'getMinecraftServerStatus' }),
            });
            if (!res.ok) { throw new Error(`Response returned ${res.status}: ${res}`); }
            const payload = await res.json() as MinecraftServerStatusResponse;
            resolve(payload);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

export async function stopMinecraftServer(): Promise<GenericServerResponse> {
    return new Promise( async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/mc-server`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
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

