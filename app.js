import 'dotenv/config';
import express from 'express';
import {
	InteractionType,
	InteractionResponseType,
	InteractionResponseFlags,
	MessageComponentTypes,
	verifyKeyMiddleware,
} from 'discord-interactions';


const app = express();
const PORT = process.env.PORT || 3000;


app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
	const { id, type, data } = req.body;
	
	if (type === InteractionType.PING) { return res.send({ type: InteractionResponseType.PONG }) }; 	// Verification Requests

	if (type === InteractionType.APPLICATION_COMMAND) {
		const { name } = data;

		if (name === 'test'){
			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					flags: InteractionResponseFlags.IS_COMPONENTS_V2,
					components: [
						{
							type: MessageComponentTypes.TEXT_DISPLAY,
							content: 'kys',
						}
					]
				}
			});
		}

		console.error(`Unknown Command ${name}`);
		return res.status(400).json({ error: 'Unknown Command' });
	}
	console.error(`Unknown Interaction Type ${type}`);
	return res.status(400).json({ error: 'Unknown Interaction Type' });

})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})
