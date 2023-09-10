class YesnowtfApi {
	apiUrl = 'https://yesno.wtf/api';

	async getJson(forced = false) {
		const forceTypes = ['yes', 'no', 'maybe'];
		if (forced && forceTypes.includes(forced)) this.apiUrl += '?force=' + forced;
		return await fetch(this.apiUrl).then((response) => response.json());
	}

	async getGif(forced = false) {
		const response = await this.getJson(forced);
		console.log('YesnowtfApi response:', response);
		return response.image;
	}
}

class TgApi {
	constructor(token) {
		this.baseUrl = `https://api.telegram.org/bot${token}/`;
	}

	getUpdateType(updateJson) {
		// At most one of the optional parameters can be present in any given update.
		for (const key in updateJson) if (key !== 'update_id') return key;
	}

	async send(data, method = 'sendMessage') {
		const init = {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		return await fetch(this.baseUrl + method, init).then((response) => response.json());
	}

	async sendRegularMessage(text, chatId, parseMode = null) {
		const data = {
			chat_id: chatId,
			text: text,
		};
		if (parseMode) data.parse_mode = parseMode;
		return await this.send(data);
	}

	async sendAnimation(animUrl, chatId) {
		const data = {
			chat_id: chatId,
			animation: animUrl,
		};
		return await this.send(data, 'sendAnimation');
	}

	async answerInlineQuery(inlineQueryId, results, inlineQueryResultsButton = null) {
		const data = {
			inline_query_id: inlineQueryId,
			results: results,
			cache_time: 0,
		};
		if (inlineQueryResultsButton) data.button = inlineQueryResultsButton;
		return await this.send(data, 'answerInlineQuery');
	}

	inlineQueryResultArticle(messageText, title, description = null, parseMode = null) {
		const inputTextMessageContent = { message_text: messageText, ...(parseMode && { parse_mode: parseMode }) };
		return {
			type: 'article',
			id: '0',
			title: title,
			input_message_content: inputTextMessageContent,
			...(description && { description: description }),
		};
	}

	inlineQueryResultGif(gifUrl) {
		return {
			type: 'gif',
			id: '1',
			gif_url: gifUrl,
			thumbnail_url: 'https://yesno.wtf/assets/favicons/favicon-196x196-d7156a060e23907ce2dce339a7fef7df.png',
			title: 'Title',
			caption: 'Caption',
		};
	}
}

function commandRollIntRange(max = 6, min = 1) {
	if (!(max = parseInt(max)) || !(min = parseInt(min))) return;
	if (max < min) [max, min] = [min, max];
	return `[${min},${max}] -> ` + (Math.floor(Math.random() * (max - min + 1)) + min);
}

async function handleRegularCommand(updateJson, tgApi) {
	let commands = {
		gif: 'Get a random GIF from yesno\\.wtf\\. ' + 'Optional arguments to specific GIF type: yes / no / maybe\\. ' + 'Example: `/gif yes`',
		roll:
			'Roll a random int in range\\. ' +
			'Default is \\[1,6\\], one argument to change the max value, two arguments to change min and max\\. ' +
			'Example: `/roll 10 20`',
	};
	commands.help =
		'*Commands:*\n' +
		Object.keys(commands)
			.map((key) => `/${key} \\- ${commands[key]}`)
			.join('\n');

	const yesnowtfApi = new YesnowtfApi();

	const chatId = updateJson.message.chat.id;

	const command = updateJson.message.text.split(/\s+/);
	console.log('Command:', command);

	switch (command[0]) {
		case '/start':
		case '/help':
			return await tgApi.sendRegularMessage(commands.help, chatId, 'MarkdownV2');

		case '/gif':
			const gifTypes = ['yes', 'no', 'maybe'];
			let gifType = false;

			if (command.length == 1) gifType = false;
			else if (command.length == 2 && gifTypes.includes(command[1].toLowerCase())) gifType = command[1].toLowerCase();
			else break;

			return await tgApi.sendAnimation(await yesnowtfApi.getGif(gifType), chatId);

		case '/roll':
			if (command.length > 3) break;

			const text = commandRollIntRange(...command.slice(1).reverse());
			if (text) return await tgApi.sendRegularMessage(text, chatId);
			break;
	}
	return await tgApi.sendRegularMessage('Invalid command. Send /help for help', chatId);
}

async function handleInlineQuery(updateJson, tgApi) {
	const { id: inlineQueryId, query } = updateJson.inline_query;

	const command = query.split(/\s+/);
	console.log('Query command:', command);

	switch (command[0]) {
		case '':
		case 'gif':
			const yesnowtfApi = new YesnowtfApi();
			const { answer, image } = await yesnowtfApi.getJson();
			// subcommands: yes / no / maybe (show GIF directly)
			return await tgApi.answerInlineQuery(inlineQueryId, [
				tgApi.inlineQueryResultArticle(
					`[${answer.charAt(0).toUpperCase() + answer.slice(1)}](${image})`,
					'Get a random GIF',
					'Not using GIF mode because it will leak the result',
					'MarkdownV2'
				),
			]);

		case 'roll':
			if (command.length > 3) break;

			const text = commandRollIntRange(...command.slice(1).reverse());
			if (text)
				return await tgApi.answerInlineQuery(inlineQueryId, [
					tgApi.inlineQueryResultArticle(text, 'Roll a number in range ' + text.split(' -> ')[0], 'Example: roll 10 20'),
				]);
			break;
	}

	return await tgApi.answerInlineQuery(inlineQueryId, [tgApi.inlineQueryResultArticle('Not a valid command', 'Not a valid command')]);
}

export default {
	async fetch(request, env, ctx) {
		const tgApi = new TgApi(env.TG_BOT_TOKEN);

		const requestJson = await request.json();
		console.log('Request:', requestJson);

		const messageType = tgApi.getUpdateType(requestJson);
		console.log('Message type:' + messageType);
		if (messageType == 'message') console.log(await handleRegularCommand(requestJson, tgApi));
		else if (messageType == 'inline_query') console.log(await handleInlineQuery(requestJson, tgApi));

		return new Response();
	},
};
