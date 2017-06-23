// @ts-check

require("dotenv").config();

const Botkit = require("botkit");

if (!process.env.BOT_OAUTH_TOKEN) {
  console.error(
    "BOT_OAUTH_TOKEN environment variable not defined");
  process.exit(1);
}

const controller = Botkit.slackbot({});

const bot = controller.spawn({
  token: process.env.BOT_OAUTH_TOKEN
}).startRTM();

process.on("exit", bot.destroy);
process.on("SIGINT", () => {
  bot.destroy();
  process.exit(1);
});

const events = [
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
