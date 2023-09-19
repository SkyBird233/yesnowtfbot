# Yesno.wtf Bot
An unofficial telegram bot for [yesno.wtf](https://yesno.wtf).

Try it out: [@yesno_wtf_bot](https://t.me/yesno_wtf_bot)


## Usage
You can interact with the bot in two ways: direct messaging or inline mode. (Get detailed usage instructions by sending `/help` to the bot.)
### GIF
Use the bot to get a GIF from [yesno.wtf](https://yesno.wtf) directly. You can get a random one or specify the type of the GIF (yes / no / maybe).
### Roll
Some times two options are not enough, so you can also use the bot to roll a number within a range. The default range is \[1, 6\], but you can also specify it.


## Deployment

### Telegram Bot Setup
To set up the bot, you need to talk to [BotFather](https://t.me/botfather) first:
1. Use `/newbot` to create a new bot and obtain your bot token.
2. Use `/setinline` to enable inline mode for your bot.
3. _Optional_: Set up bot's command list, description, about text and avatar.

### Deploying to Cloudflare Workers
1. Make sure you have Node.js installed on your system.
2. Set your bot token as a secret:
```sh
npx wrangler seccret put TG_BOT_TOKEN
```
3. Deploy to Cloudflare Workers:
```sh
npx wrangler deploy
```

### Setting up the webhook
Example:
```sh
curl -v "https://api.telegram.org/bot{YOUR_TG_BOT_TOKEN}/setWebhook?url=https://yesnowtfbot.{YOUR_CF_USERNAME}.workers.dev"
```
Remember to replace `{YOUR_TG_BOT_TOKEN}` and `{YOUR_CF_USERNAME}` with your values. You can also change the subdomain `yesnowtfbot` by editing `wrangler.toml`.
