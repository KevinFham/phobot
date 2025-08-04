const util = await import('node:util');
import { exec } from 'child_process';

export async function exec_p(command) {
    return new Promise(( resolve, reject ) => {
        exec(command, (err, stdout, stderr) => {
            resolve({ stdout, stderr });
            return;
        });
    });
}

