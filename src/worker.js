class YesnowtfApi {
	apiUrl = 'https://yesno.wtf/api';

	async getJson(forced = false) {
		//forced: yes / no / maybe
		if (forced) this.apiUrl += '?force=' + forced;
		return await fetch(this.apiUrl).then((response) => response.json());
	}

	async getGif(forced = false) {
		return (await this.getJson(forced)).image;
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

	async sendMessage(data, method = 'sendMessage') {
		const init = {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		return await fetch(this.baseUrl + method, init).then((response) => response.json());
	}

	async sendRegularMessage(text, chatId, parse_mode = null) {
		const data = {
			chat_id: chatId,
			text: text,
		};
		if (parse_mode) data.parse_mode = parse_mode;
		return await this.sendMessage(data);
	}

	async sendAnimation(animUrl, chatId) {
		const data = {
			chat_id: chatId,
			animation: animUrl,
		};
		return await this.sendMessage(data, 'sendAnimation');
	}
}

function commandRollIntRange(max = 6, min = 1) {
	if (!(max = parseInt(max)) || !(min = parseInt(min))) return 'Invalid command';
	if (max < min) [max, min] = [min, max];
	return `[${min},${max}] -> ` + (Math.floor(Math.random() * (max - min + 1)) + min);
}

export default {
	async fetch(request, env, ctx) {
		const yesnowtfApi = new YesnowtfApi();
		const tgApi = new TgApi(env.TG_BOT_TOKEN);
		const requestJson = await request.json();

		console.log('Request: ', requestJson);

		const messageType = tgApi.getUpdateType(requestJson);
		console.log('Message type: ' + messageType);
		if (messageType !== 'message') return new Response();

		const command = requestJson.message.text.split(/\s+/);
		const chatId = requestJson.message.chat.id;
		console.log('Command: ' + command);

		if (command[0] === '/start') {
			const text = '*\\*WIP\\**\nType /gif to get a random gif from yesno\\.wtf';
			console.log(await tgApi.sendRegularMessage(text, chatId, 'MarkdownV2'));
		} else if (command[0] === '/gif') {
			console.log(await tgApi.sendAnimation(await yesnowtfApi.getGif(), chatId));
		} else if (command[0] === '/help') {
			const text =
				'*Commands:*\n/gif \\- Get a random GIF from yesno\\.wtf \\.\n/roll \\- Roll a random int in range\\. Default is \\[1,6\\], one argument to change the max value, two arguments to change min and max\\. Example: `/roll 10 20`';
			console.log(await tgApi.sendRegularMessage(text, chatId, 'MarkdownV2'));
		} else if (command[0] === '/roll') {
			const text = commandRollIntRange(...command.slice(1).reverse());
			console.log(await tgApi.sendRegularMessage(text, chatId));
		}
		return new Response();
	},
};
