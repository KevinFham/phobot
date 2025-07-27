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

const ENABLE_COMMANDS = [TEST_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ENABLE_COMMANDS);
