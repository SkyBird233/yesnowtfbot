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

export default {
	async fetch(request, env, ctx) {
		const yesnowtfApi = "https://yesno.wtf/api";
		const requestJson = await request.json();

		const yesnowtfData = await fetch(yesnowtfApi).then(response => response.json());

		const command = requestJson.message.text.split(" ");

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
				"animation": yesnowtfData.image,
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

			if (command.length === 1) {
				data.text = "[1,6] -> " + (Math.floor(Math.random() * 6) + 1);
			}
			else if (command.length === 2) {
				data.text = "[1," + command[1] + "] -> " + (Math.floor(Math.random() * command[1]) + 1);
			}
			else if (command.length === 3) {
				data.text = "[" + command[1] + "," + command[2] + "] -> " + (Math.floor(Math.random() * (command[2] - command[1] + 1)) + parseInt(command[1]));
			}
			else {
				data.text = "Invalid command";
			}

			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN));
		}
		return new Response();
	},
}

