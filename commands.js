import 'dotenv/config';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Integration Types: https://discord.com/developers/docs/resources/application#application-object-application-integration-types
// Contexts: https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types

const TEST_COMMAND = {
	name: 'test',
	description: 'test cmd',
	type: 1,
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

const START_SERVER_COMMAND = {
	name: 'serverstart',
	description: 'Start the server machine',
	type: 1,
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

const ENABLE_COMMANDS = [START_SERVER_COMMAND];

console.log('Enabling commands:');
ENABLE_COMMANDS.forEach((cmd) => {
	console.log(`\t${cmd?.name}`);
})

InstallGlobalCommands(process.env.APP_ID, ENABLE_COMMANDS);
