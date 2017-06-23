// @ts-check

require("dotenv").config();

const Botkit = require("botkit");

if (!process.env.BOT_OAUTH_TOKEN || !process.env.PORT) {
  console.error(
    "Please specify BOT_OAUTH_TOKEN and PORT in environment variables");
  process.exit(1);
}

let controller = Botkit.slackbot({});

let bot = controller.spawn({
  token: process.env.BOT_OAUTH_TOKEN
});

bot.startRTM(function (err, bot, payload) {
  console.log(`err: ${err}`);
  console.log(`bot: ${bot}`);
  console.log(`payload: ${payload}`);
});
