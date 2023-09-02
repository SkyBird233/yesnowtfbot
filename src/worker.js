class YesnowtfApi {
	apiUrl = "https://yesno.wtf/api";

	async getJson(forced = false) {
		//forced: yes / no / maybe
		if (forced) this.apiUrl += "?force=" + forced;
		return await fetch(this.apiUrl).then(response => response.json());
	}

	async getGif(forced = false) {
		return (await this.getJson(forced)).image;
	}
}

async function sendTgMessage(data, token, method = "sendMessage") {
	const tgApi = `https://api.telegram.org/bot${token}/`;
	const init = {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
	}
	return await fetch(tgApi + method, init).then(response => response.json());
}

function commandRollIntRange(max = 6, min = 1) {
	if (!(max = parseInt(max)) || !(min = parseInt(min))) return "Invalid command";
	if (max < min) [max, min] = [min, max];
	return `[${min},${max}] -> ` + (Math.floor(Math.random() * (max - min + 1)) + min);
}

export default {
	async fetch(request, env, ctx) {
		const yesnowtfApi = new YesnowtfApi();
		const requestJson = await request.json();

		console.log("Request: " + JSON.stringify(requestJson));

		if (!Object.hasOwn(requestJson, "message")) { // edited_message / query
			console.log("Not a message");
			return new Response();
		}
		const command = requestJson.message.text.split(/\s+/);
		console.log("Command: " + command);

		if (command[0] === "/start") {
			const data = {
				"chat_id": requestJson.message.chat.id,
				"text": "*\\*WIP\\**\nType /gif to get a random gif from yesno\\.wtf",
				"parse_mode": "MarkdownV2",
			}
			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN));
		}
		else if (command[0] === "/gif") {
			const data = {
				"chat_id": requestJson.message.chat.id,
				"animation": await yesnowtfApi.getGif(),
			}
			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN, "sendAnimation"));
		}
		else if (command[0] === "/help") {
			const data = {
				"chat_id": requestJson.message.chat.id,
				"text": "*Commands:*\n/gif \\- Get a random GIF from yesno\\.wtf \\.\n/roll \\- Roll a random int in range\\. Default is \\[1,6\\], one argument to change the max value, two arguments to change min and max\\. Example: `/roll 10 20`",
				"parse_mode": "MarkdownV2",
			}
			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN));
		}
		else if (command[0] === "/roll") {
			const data = {
				"chat_id": requestJson.message.chat.id,
				"text": "",
			}
			data.text = commandRollIntRange(...command.slice(1).reverse());

			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN));
		}
		return new Response();
	},
}

