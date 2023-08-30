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


		if (requestJson.message.text === "/start") {
			const data = {
				"chat_id": requestJson.message.chat.id,
				"text": Date(),
			}
			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN));
		}
		else if (requestJson.message.text === "/gif") {
			const data = {
				"chat_id": requestJson.message.chat.id,
				"animation": yesnowtfData.image,
			}
			console.log(await sendTgMessage(data, env.TG_BOT_TOKEN, "sendAnimation"));
		}
		return new Response();
	},
}

