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

bot.startRTM(function (err) {
  if (err) {
    console.error(err);
  }
});

process.on("exit", bot.destroy);
process.on("SIGINT", () => {
  bot.destroy();
  process.exit(1);
});

let events = [
  // User Activity Events
  "message_received",
  "bot_channel_join",
  "user_channel_join",
  "bot_group_join",
  "user_group_join",
  // Message Received Events
  "direct_message",
  "direct_mention",
  "mention",
  "ambient",
  // Websocket Events
  "rtm_open",
  "rtm_close",
  "rtm_reconnect_failed"
];
events.forEach((event) => {
  controller.on(event, () => console.log(event + " event fired"));
});
