import { parseConfig } from '@/src/utils.js';

const cfg = parseConfig();

export interface GenericServerResponse {
    code: number,
    message: string
};

export async function startVps(): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/vps`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'startVps' }),
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

export async function getVpsStatus(): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/vps`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'getVpsStatus' }),
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

export async function stopVps(): Promise<GenericServerResponse> {
    return new Promise(async function(resolve, reject) {
        try {
            const res = await fetch(`http://${cfg.apiServer.serverHostName}/api/vps`, {
                method: 'POST', headers: { "Content-Type": "application/json;charset=UTF-8", },
                body: JSON.stringify({ 'action': 'stopVps' }),
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
