const TwitterApi = require('twitter-api-v2').TwitterApi;
const Arena = require("are.na");

const toolState = require("./post-arena-to-twitter.state.json")

const LOG_LEVEL = process.env.LOG_LEVEL || "ERROR";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

const ARENA_USER = {
  slug: 'korede-aderele',
  id: 60392,
  token: process.env.ARENA_PERSONAL_ACCESS_TOKEN
}
const arenaClient = new Arena({accessToken: ARENA_USER.token});
const ARENA_CHANNELS = [
  'Historiography',
  // 'SURULERE RESEARCH',
  '~~stream~~',
  'Yoruba History+Language+Religion',
  'Permaculture',
  'African Empires+States',
  'Oral Tradition',
  'Nigeria History',
  'Hausa Language+Religion',
  'Music Production',
  // 'sociology, economics',
  'Igbo Language+Religion',
  // 'screenshots',
  // 'map software',
  'Nigeria Politics',
  'Maps',
  'Mutual Aid',
  'Startup'
];

async function tweet({text, reply, media}) {
  const dryRun = toolState.dryRunTweet;
  if (dryRun) {
    console.log("TWEET", {text, reply, media});
    return {data: {id: "TEST-REPLY-ID"}, errors: []}
  } else {
    if (reply) {
      return await twitterClient.v2.reply(text, reply);
    } else {
      return await twitterClient.v2.tweet(text);
    }
  }
}

async function main() {
  const postNewBlocksSince = new Date(toolState.postNewBlocksSince);
  const postNewBlocksTill = toolState.postNewBlocksTill ? new Date(toolState.postNewBlocksTill) : new Date();
  const blocksToPost = {}; // Map<String: block_id, Block>
  const allChannelNames = new Set()
  const blockChannelsMap = {}; // Map<String: block_id, Set<String>>

  const channels = await arenaClient
    .user(ARENA_USER.id)
    .channels()
  console.log('ARENA channels resp', channels?.map(c => c.title), channels?.length)
  try {
    console.log('ARENA channels resp 0', channels[0])
    console.log('> channels loop start')
    for (var i = 0; i < channels.length; i++) {
      console.log(`>> channels iter ${i}`)
      const channel = channels[i]
      if (!ARENA_CHANNELS.includes(channel.title)) continue
      if (!channel.contents) {
        if (LOG_LEVEL === "DEBUG") console.log(`Skipping channel idx ${i} due to empty contents`)
        continue
      }
      console.log('>> blocks loop start')
      for (var j = 0; j < channel.contents?.length; j++) {
        console.log(`>>> blocks iter ${j} start`)
        const block = channel.contents[j]
        let block_connected_date = new Date(block.connected_at)
        console.log(`>>> considering block to post, in date range SINCE:${postNewBlocksSince.toDateString()} < ${block_connected_date} <= TILL:${postNewBlocksTill.toDateString()}`)
        if (block_connected_date > postNewBlocksSince && block_connected_date <= postNewBlocksTill) {
          console.log(`>>>> adding block to post, since in date range`)
          blocksToPost[block.id] = block
          if (block.id in blockChannelsMap) {
            blockChannelsMap[block.id].add(channel.title)
          } else {
            blockChannelsMap[block.id] = new Set([channel.title])
          }
          allChannelNames.add(channel.title)
        }
      }
      console.log('>> blocks loop finish')
      if (LOG_LEVEL === "DEBUG") console.log({
        name: channel.title,
        blocks_preview: channel.contents?.slice(0, 5).map(block => block.title),
      })
    }
  } catch (err) {
    console.error("ARENA ERR", err)
    return
  }

  console.log("ARENA", blocksToPost);
  if (LOG_LEVEL === "DEBUG") console.log("ARENA", blocksToPost, blockChannelsMap);

  const blocksToPostList = Object.values(blocksToPost)
  if (blocksToPostList.length === 0) {
    console.info("No blocks to post this time :/")
    return
  }

  const threadHeaderContent = `
Research Update 🧵 ${new Date().toDateString()}: ${blocksToPostList?.length || 'a # of '} recently collected links by category

Categories include ${Array.from(allChannelNames).join(', ')}
`.trim()

  const fmtBlockAsTweet = (block) =>
    `
     ${block.title}
https://are.na/block/${block.id}
`.trim()
  const {data, errors} = await tweet({
    text: threadHeaderContent,
  })
  console.log({data, errors})
  if (errors?.length) {
    console.error("TWEET ERR", errors);
    return;
  }
  let replyToId = data?.id
  for (const block of blocksToPostList) {
    const {data, errors} = await tweet({
      text: fmtBlockAsTweet(block),
      reply: replyToId
    })
    console.log({data, errors})
    if (errors?.length) {
      console.error("TWEET ERR", errors);
      return;
    }
    replyToId = data?.id
  }

  console.log()
}
main()
