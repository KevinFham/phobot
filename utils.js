import { readFileSync, existsSync } from 'fs';
import YAML from 'yaml';
import { exec } from 'child_process';

// Promisified Exec
const exec_p = async (command) => {
    return new Promise(( resolve, reject ) => {
        exec(command, (err, stdout, stderr) => {
            resolve({ stdout, stderr });
            return;
        });
    });
}

const parseConfig = () => {
    if (!existsSync('./config.yml')) {
        console.error('No config.yml file found!');
        process.exit(0);
    }

    const file = readFileSync('./config.yml', 'utf8');
    let configData = YAML.parse(file);

    return configData;
}

export { exec_p, parseConfig };
