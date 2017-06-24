// @ts-check

require("dotenv").config();

const Botkit = require("botkit");

if (!process.env.BOT_OAUTH_TOKEN || !process.env.PORT) {
  console.error(
    "BOT_OAUTH_TOKEN or PORT environment variables not defined");
  process.exit(1);
}

const controller = Botkit.slackbot({});

// Connect to the Slack Real Time Messaging API
const bot = controller.spawn({
  token: process.env.BOT_OAUTH_TOKEN
}).startRTM();

// Heroku shits the bed if it doesn't have something listening on the
// port that it hands you in the PORT environment variable, so we spawn
// a web server on it. This is also needed for receiving webhooks so
// we set that up too.
controller.setupWebserver(process.env.PORT, function () {
  controller.createWebhookEndpoints(controller.webserver);
});

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

controller.hears("hello", "direct_message,direct_mention,mention", function (
  bot, msg) {
  bot.reply(msg, "y helo thar");
});
