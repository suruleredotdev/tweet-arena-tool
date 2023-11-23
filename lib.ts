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
  "Buddhism",

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

// load Are.na content - triggered by change to start/end date inputs
export async function loadBlocksFromAllChannels() {
  const allChannels: Array<Arena.Channel> = window.localStorage.getItem(
    "allChannels"
  )
    ? JSON.parse(window.localStorage.getItem("allChannels"))
    : await arenaClient.user(ARENA_USER.id).channels();
  const channelNamesToBlockIds = Object.fromEntries(
    allChannels?.map((c: Arena.Channel) => [c.title, []])
  );
  const allBlocks: Array<Arena.Block> = [];
  allChannels?.map((c: Arena.Channel) => {
    allBlocks.push(...c.contents);
    channelNamesToBlockIds[c.title].push();
  });
  const blocksMap = Object.fromEntries(
    allBlocks?.map((b: Arena.Block) => [b.id, b])
  );
  return {
    blocksMap,
    channelNamesToBlockIds,
  };
}

export function filterBlocks(
  blocksMap: Record<string, Arena.Block>,
  selectedChannelsNames: Array<string>,
  postNewBlocksSince: Date,
  postNewBlocksTill: Date
): Record<number, Arena.Block> {
  console.log({ selectedChannelsNames });
  const blocksToTweet: Record<number, Arena.Block> = {};
  const blocks: Array<Arena.Block> = Object.values(blocksMap);
  try {
    for (var j = 0; j < blocks.length; j++) {
      const block = blocks[j];
      const channelTitle = block?.connections?.[0].title;
      console.log(`>>> blocks iter ${j} start`, {
        channel_name: channelTitle,
      });
      if (selectedChannelsNames.includes(channelTitle)) {
        continue;
      }
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
      }
    }
    console.log({
      title: "ARENA",
      blocksToTweet,
    });
  } catch (err) {
    console.error("ERR filtering blocks, returning all!", err);
    return blocksMap;
  } finally {
    return blocksToTweet;
  }
}
