import { TwitterApi } from "twitter-api-v2";
import Arena from "are.na";

import toolConfig from "./tool-config.json" assert { type: "json" };

import {
  getBlocksToPost,
  ARENA_USER,
  ARENA_CHANNELS,
  arenaClient,
} from "./lib";

export const LOG_LEVEL = process.env.LOG_LEVEL || "ERROR";
const DRY_RUN = Boolean(process.env.LOG_LEVEL) || toolConfig.dryRunTweet;
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function tweet({
  text,
  reply,
  media,
  ...args
}: {
  text: string;
  reply?: string;
  media?: any;
  [key: string]: any;
}): Promise<{ data: { id: string; [key: string]: any }; errors?: any[] }> {
  if (DRY_RUN) {
    console.log("TWEET*", {
      text,
      reply,
      media,
      textLen: text.length,
      textOver280: text.length > 280,
    });
    return { data: { id: "TEST-REPLY-ID", ...args }, errors: [] };
  } else {
    if (reply) {
      return await twitterClient.v2.reply(text, reply);
    } else {
      return await twitterClient.v2.tweet(text);
    }
  }
}

type Args = {
  postNewBlocksSince: Date;
  postNewBlocksTill?: Date;
  blockIds?: string[];
};
function getArgs(): Args {
  let rawCliArgs: Record<string, string> = {},
    acc: string[] = [];
  for (const curr of process.argv) {
    if (acc.length === 0) continue;
    const argKey = acc[acc.length - 1];
    switch (argKey) {
      case "blockIds":
        rawCliArgs[acc[acc.length - 1]] = JSON.parse(curr);
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
    "postNewBlocksTill" in rawCliArgs
      ? new Date(rawCliArgs["postNewBlocksTill"])
      : "postNewBlocksTill" in toolConfig
      ? new Date(toolConfig["postNewBlocksTill"] as string)
      : new Date();
  return {
    postNewBlocksSince,
    postNewBlocksTill,
    blockIds: new Array(rawCliArgs["blockIds"]),
  };
}

// const LOG_LEVELS = ["INFO", "DEBUG", "ERROR"];
//
// function log(level, ...args) {
//   if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(level)) {
//     console[level || "log"](...args);
//   }
// }

function fmtBlockAsTweet(block: Arena.Block) {
  const MAX_TITLE_LEN = 75;
  const MAX_DESC_LEN = 140 - (block.source?.url?.length || 0);

  return `${block.title?.slice(0, MAX_TITLE_LEN) + ":\n" || ""}${
    block.description?.slice(0, MAX_DESC_LEN) || ""
  }${block.description?.length > MAX_DESC_LEN ? "..." : ""}

Context: https://are.na/block/${block.id}
Source: ${block.source?.url}
`.trim();
}

async function tweetThreadFromBlocks(
  blocksToTweetList: Arena.Block[],
  allChannelNames: Set<string>
) {
  const threadHeaderContent = `
Research Update 🧵 ${new Date().toDateString()}: ${
    blocksToTweetList?.length || "a # of "
  } recently collected links by category

Categories include ${Array.from(allChannelNames).join(", ")}
`.trim();

  const { data, errors } = await tweet({
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
    const { data: tweetData, errors } = await tweet({
      text: fmtBlockAsTweet(arenaBlock),
      reply: replyToId,
      media: null,
      connected_at: arenaBlock?.connections[0]?.updated_at,
      // source_url: arenaBlock.,
    });
    if (LOG_LEVEL === "DEBUG") console.log({ tweetData, errors });
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
  console.log("ARGS", args);
  const { postNewBlocksSince, postNewBlocksTill } = args;

  const channels = await arenaClient.user(ARENA_USER.id).channels();
  console.log(
    "ARENA channels resp",
    channels?.map((c) => c.title),
    channels?.length
  );

  const { blocksToTweet, allChannelNames } = await getBlocksToPost(
    channels,
    postNewBlocksSince,
    postNewBlocksTill
  );

  const blocksToTweetList: Arena.Block[] = Object.values(blocksToTweet);
  if (blocksToTweetList.length === 0) {
    console.info("No blocks to post this time :/");
    return;
  }
  await tweetThreadFromBlocks(blocksToTweetList, allChannelNames);

  console.log("new lastRunTime: ", new Date().toISOString());
}

runMain();
