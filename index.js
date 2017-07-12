// @ts-check

require("dotenv").config();

const Botkit = require("botkit");
const RSS = require("./rss.js");

// The channels the bot is a member of
const memberChannels = [];

if (!process.env.SLACK_OAUTH_TOKEN || !process.env.PORT) {
  console.error(
    "SLACK_OAUTH_TOKEN or PORT environment variables not defined");
  process.exit(1);
}

const controller = Botkit.slackbot({});

// Connect to the Slack Real Time Messaging API
const bot = controller.spawn({
  token: process.env.SLACK_OAUTH_TOKEN
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

// Call the relevant API methods to discern which channels/groups we're
// a member of.
function findMemberChannels() {
  bot.api.channels.list({
    exclude_archived: true,
    exclude_members: true
  }, function (err, response) {
    if (err) {
      console.error(err);
      return;
    }
    response.channels.forEach((channel) => {
      if (channel.is_member) {
        if (memberChannels.indexOf(channel.id) === -1) {
          memberChannels.push(channel.id);
        }
      }
    });
  });

  bot.api.groups.list({
    exclude_archived: true
  }, function (err, response) {
    if (err) {
      console.error(err);
      return;
    }
    response.groups.forEach((group) => {
      if (memberChannels.indexOf(group.id) === -1) {
        memberChannels.push(group.id);
      }
    });
  });
}

if (process.env.DEBUG === "true") {
  const events = [
    "hello",
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
}

// "hello" is fired when we're connected
controller.on("hello", () => {
  findMemberChannels();
  RSS.setCallback((article) => {
    postArticle(article);
  });
  RSS.startFeedCheck();
});

controller.hears("ping", "direct_message,direct_mention,mention", function (
  bot, msg) {
  bot.reply(msg, "Pong! Listening on " + memberChannels.join(", "));
});

function postArticle(article) {
  memberChannels.forEach(function (memberChannel) {
    bot.api.chat.postMessage({
      channel: memberChannel,
      text: `${article.title} ${article.link}\n<${article.comments}|Comments>`
    }, function (err, response) {
      if (err) {
        console.error(err);
      } else {
        console.log(response);
      }
    });
  });
}
