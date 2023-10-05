/*
import TwitterApi from 'twitter-api-v2'
import Arena from "are.na"

import toolConfig from "./post-arena-to-twitter.state.json"
/*
*/

const TwitterApi = require("twitter-api-v2").TwitterApi;
const Arena = require("are.na");
const toolConfig = require("./tool-config.json");

const LOG_LEVEL = process.env.LOG_LEVEL || "INFO";
const DRY_RUN = Boolean(process.env.LOG_LEVEL) || toolConfig.dryRunTweet;

process.env.TZ = "America/Los_Angeles";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const ARENA_USER = {
  slug: "korede-aderele",
  id: 60392,
  token: process.env.ARENA_PERSONAL_ACCESS_TOKEN,
};
const arenaClient = new Arena({accessToken: ARENA_USER.token});
const ARENA_CHANNELS = [
  // 'SURULERE RESEARCH',
  "~~stream~~",
  "Stream",
  "Permaculture",

  "Historiography",
  "African Empires+States",
  "Yoruba History+Language+Religion",
  "Hausa History+Language+Religion",
  "Igbo History+Language+Religion",
  "Oral Tradition",
  "Nigeria History",
  "Nigeria Politics",

  "Music Production",
  // 'sociology, economics',
  // 'screenshots',
  // 'map software',
  "Nigeria Politics",
  "Maps",
  "Mutual Aid",
  "Startup",
];

async function tweet({text, reply, media, ...args}) {
  // : {text: string, reply?: string, media?: any}) {
  if (DRY_RUN) {
    console.log("TWEET*", {
      text,
      reply,
      media,
      textLen: text.length,
      textOver280: text?.length > 280,
    });
    return {data: {id: "TEST-REPLY-ID", ...args}, errors: []};
  } else {
    if (reply) {
      return await twitterClient.v2.reply(text, reply);
    } else {
      return await twitterClient.v2.tweet(text);
    }
  }
}

function getArgs() {
  let cliArgs = {},
    acc = [];
  for (const curr of process.argv) {
    if (acc.length === 0) continue;
    const argKey = acc[acc.length - 1];
    switch (argKey) {
      case "blockIds":
        cliArgs[acc[acc.length - 1]] = JSON.parse(curr);
        break;
      default:
        break;
    }
  }
  const postNewBlocksSince = new Date(toolConfig.postNewBlocksSince);
  if (!postNewBlocksSince) {
    console.error("missing toolConfig.postNewBlocksSince", toolConfig);
  }
  const postNewBlocksTill =
    "postNewBlocksTill" in toolConfig
      ? new Date(toolConfig["postNewBlocksTill"])
      : "postNewBlocksTill" in cliArgs
        ? new Date(cliArgs.postNewBlocksTill)
        : new Date();
  return {
    postNewBlocksSince,
    postNewBlocksTill,
    blockIds: new Array(cliArgs.blockIds),
  };
}

async function getBlocksToPost() {
  return [];
}

function fmtBlockAsTweet(block) {
  const MAX_TITLE_LEN = 75;
  const MAX_DESC_LEN = 140 - (block.source?.url?.length || 0);

  return `${block.title?.slice(0, MAX_TITLE_LEN) + ":\n" || ""}${block.description?.slice(0, MAX_DESC_LEN) || ""
    }${block.description?.length > MAX_DESC_LEN ? "..." : ""}

Context: https://are.na/block/${block.id}
Source: ${block.source?.url}
`.trim();
}

async function tweetThreadFromBlocks(blocksToTweetList, allChannelNames) {
  const threadHeaderContent = `
Research Update 🧵 ${new Date().toDateString()}: ${blocksToTweetList?.length || "a # of "
    } recently collected links by category

Categories include ${Array.from(allChannelNames).join(", ")}
`.trim();

  const {data, errors} = await tweet({
    text: threadHeaderContent,
  });
  console.log({
    data,
    errors,
    tweetLink: `https://twitter.com/suruleredotdev/status/${data?.id}`,
  });
  if (errors?.length) {
    console.error("TWEET ERR", errors);
    return;
  }
  let replyToId = data?.id;
  for (const arenaBlock of blocksToTweetList) {
    /*
    await saveArenaBlock(db, arenaBlock.id, arenaBlock.source.url)
    */
    const {data: tweetData, errors} = await tweet({
      text: fmtBlockAsTweet(arenaBlock),
      reply: replyToId,
      media: null,
      connected_at: arenaBlock.connected_at,
      // source_url: arenaBlock.,
    });
    if (LOG_LEVEL === "INFO") console.info({tweetData, errors});
    if (errors?.length) {
      console.error("TWEET ERR", errors);
      return;
    }
    /*
    await saveTweetInThread(db, tweetData?.id, arenaBlock.source.url)
    await linkArenaBlockToTweet(db, arenaBlock?.id, tweetData?.id)
    */
    replyToId = tweetData?.id;
  }
}

async function runMain() {
  const args = getArgs();
  if (LOG_LEVEL === "DEBUG") console.log("ARGS", args);
  const {postNewBlocksSince, postNewBlocksTill} = args;

  const blocksToTweet = {}; //: Record<string, Arena.Block>
  const allChannelNames = new Set();
  const blockChannelsMap = {}; // Map<String: block_id, Set<String>>

  const channels = await arenaClient.user(ARENA_USER.id).channels();
  if (LOG_LEVEL === "DEBUG") console.log(
    "ARENA channels resp", {
    length: channels?.length,
    titles: channels?.map((c) => c.title),
    first: channels[0]
  });

  // const db = await openDb();
  try {
    for (var i = 0; i < channels.length; i++) {
      const channel = channels[i];
      if (!ARENA_CHANNELS.includes(channel.title)) continue;
      if (LOG_LEVEL === "INFO") console.info(channel);
      if (!channel.contents) {
        if (LOG_LEVEL === "DEBUG")
          console.log(`Skipping channel idx ${i} due to empty contents`);
        continue;
      }
      for (var j = 0; j < channel.contents?.length; j++) {
        const block = channel.contents[j];
        let block_connected_date = new Date(
          Math.min.apply(null, [
            new Date(block["connected_at"]),
            new Date(block["connected_at"]),
          ])
        );
        if (LOG_LEVEL === "DEBUG") console.log(
          `>>> considering block #${block.id} "${block.title
          }" to post,
          in date range 
          SINCE:${postNewBlocksSince?.toLocaleString()} < ${block_connected_date?.toLocaleString()
          } <= TILL:${postNewBlocksTill?.toLocaleString()}`
        );
        if (
          block_connected_date > postNewBlocksSince &&
          block_connected_date <= postNewBlocksTill
        ) {
          blocksToTweet[block.id] = block;
          if (block.id in blockChannelsMap) {
            blockChannelsMap[block.id].add(channel.title);
          } else {
            blockChannelsMap[block.id] = new Set([channel.title]);
          }
          allChannelNames.add(channel.title);
        }
      }
      if (LOG_LEVEL === "DEBUG") console.log(">> blocks loop finish");
      if (LOG_LEVEL === "DEBUG")
        console.log({
          name: channel.title,
          blocks_preview: channel.contents
            ?.slice(0, 5)
            .map((block) => block.title),
        });
    }
  } catch (err) {
    console.error("ARENA ERR", err);
    return;
  }

  if (LOG_LEVEL === "DEBUG")
    console.log("ARENA", {blocksToTweet, blockChannelsMap});

  const blocksToTweetList = Object.values(blocksToTweet);
  if (blocksToTweetList.length === 0) {
    console.info("No blocks to post this time :/");
    return;
  }
  await tweetThreadFromBlocks(blocksToTweetList, allChannelNames);

  console.info("new lastRunTime: ", new Date().toISOString());
}

runMain();
