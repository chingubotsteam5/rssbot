// @ts-check

const request = require("request");
const FeedParser = require("feedparser");
const crc = require("crc");

const feedUrl = "https://news.ycombinator.com/rss";
const secondsBetweenPolls = 30;

const seenArticles = [];

let checks = 0;

let callback = (article) => {
  console.error("No callback set. Ignoring article.");
};

function seenArticle(article) {
  if (article === null) {
    console.error("article is null");
    return true;
  }
  if (article.guid === null) {
    console.error("article guid is null");
    return true;
  }
  const checksum = crc.crc32(article.guid).toString(16);
  if (seenArticles.indexOf(checksum) === -1) {
    seenArticles.push(checksum);
    return false;
  }
  return true;
}

function processArticle(article) {
  if (!seenArticle(article) && checks > 0) {
    console.log(article.title);
    callback(article);
  }
}

// The initial feed check just serves to populate the list of "seen"
// articles so that it doesn't flood any channels the bot is in with
// all the articles in a feed. Successive checks will then send any
// new articles that get posted.
function startFeedCheck() {
  console.log("[%s] Feed check #%s...", new Date(), checks);

  const feedparser = new FeedParser([]);
  feedparser.on("error", function (err) {
    console.error(err);
  });
  feedparser.on("data", processArticle);

  const req = request(feedUrl);
  req.on("error", function (err) {
    console.error(err);
  });
  req.on("response", function () {
    const stream = this; // `this` is `req`, which is a stream
    stream.pipe(feedparser);
  });
  req.on("end", () => {
    checks++;
    setTimeout(startFeedCheck, secondsBetweenPolls * 1000);
  });
}

module.exports.startFeedCheck = startFeedCheck;
module.exports.setCallback = function (cb) {
  callback = cb;
};
