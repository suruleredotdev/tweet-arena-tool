import Arena from "are.na";

export const LOG_LEVEL = process.env.LOG_LEVEL || "ERROR";

// TODO:
// const LOG_LEVELS = ["INFO", "DEBUG", "ERROR"];
//
// function log(level, ...args) {
//   if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(level)) {
//     console[level || "log"](...args);
//   }
// }

export const ARENA_USER = {
  slug: "korede-aderele",
  id: 60392,
  token: process.env.ARENA_PERSONAL_ACCESS_TOKEN,
};

export const arenaClient = new Arena({ accessToken: ARENA_USER.token });

export const ARENA_CHANNELS = [
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

export function fmtBlockAsTweet(block: Arena.Block) {
  const MAX_TITLE_LEN = 75;
  const MAX_DESC_LEN = 140 - (block.source?.url?.length || 0);

  return `${block.title?.slice(0, MAX_TITLE_LEN) + ":\n" || ""}${
    block.description?.slice(0, MAX_DESC_LEN) || ""
  }${block.description?.length > MAX_DESC_LEN ? "..." : ""}

Context: https://are.na/block/${block.id}
Source: ${block.source?.url}
`.trim();
}

export async function getBlocksToPost(
  channels: Array<Arena.Channel>,
  postNewBlocksSince: Date,
  postNewBlocksTill: Date
): Promise<{
  blocksToTweet: Record<number, Arena.Block>;
  allChannelNames: Set<string>;
}> {
  const blocksToTweet: Record<number, Arena.Block> = {};
  const allChannelNames = new Set<string>();
  const blockChannelsMap: Record<string, Set<string>> = {};
  // const db = await openDb();
  try {
    console.log("ARENA channels resp 0", channels[0]);
    console.log("> channels loop start");
    for (var i = 0; i < channels.length; i++) {
      console.log(`>> channels iter ${i}`);
      const channel = channels[i];
      if (!ARENA_CHANNELS.includes(channel.title)) continue;
      if (!channel.contents) {
        if (LOG_LEVEL === "DEBUG")
          console.log(`Skipping channel idx ${i} due to empty contents`);
        continue;
      }
      console.log(">> blocks loop start");
      for (var j = 0; j < channel.contents?.length; j++) {
        console.log(`>>> blocks iter ${j} start`, {
          channel_name: channel.title,
        });
        const block = channel.contents[j];
        let block_connected_date = new Date(
          Math.min.apply(null, [
            new Date(block?.connections?.[0]?.created_at || block.created_at),
            new Date(block?.connections?.[0]?.created_at || block.created_at),
          ])
        );
        console.log(
          `>>> considering block #${block.id} "${
            block.title
          }" to post, in date range SINCE:${postNewBlocksSince?.toDateString()} < ${block_connected_date} <= TILL:${postNewBlocksTill?.toDateString()}`
        );
        if (
          block_connected_date > postNewBlocksSince &&
          block_connected_date <= postNewBlocksTill
        ) {
          console.log(`>>>> adding block to post, since in date range`);
          blocksToTweet[block.id] = block;
          if (block.id in blockChannelsMap) {
            blockChannelsMap[block.id].add(channel.title);
          } else {
            blockChannelsMap[block.id] = new Set([channel.title]);
          }
          allChannelNames.add(channel.title);
        }
      }
      console.log(">> blocks loop finish");
      if (LOG_LEVEL === "DEBUG")
        console.log({
          name: channel.title,
          blocks_preview: channel.contents
            ?.slice(0, 5)
            .map((block) => block.title),
        });
    }
    console.log("ARENA", blocksToTweet);
    if (LOG_LEVEL === "DEBUG")
      console.log("ARENA", blocksToTweet, blockChannelsMap);
  } catch (err) {
    console.error("ARENA ERR", err);
  } finally {
    return {
      blocksToTweet,
      allChannelNames,
    };
  }
}
