import sqlite3 from 'sqlite3'
import sqlite, {open} from 'sqlite'

export async function openDb() {
  return open({
    filename: '../post-arena-to-twitter/store.sqlite3',
    driver: sqlite3.Database
  })
}

async function saveArenaBlock(db: sqlite.Database, block_id: number, block_source_url: string) {
  if (toolState.DRY_RUNTweet) return;
  return await db.run(`UPDATE "ArenaBlock" SET block_id = :block_id, block_source_url = :block_source_url ON CONFLICT (block_source_url) UPDATE (block_id)`, {
    ':block_id': block_id.toString(),
    ':block_source_url': block_source_url
  })
}

async function saveTweetInThread(db: sqlite.Database, tweet_id: string, thread_id: string) {
  if (toolState.DRY_RUNTweet) return;
  return await db.run(`INSERT INTO "TweetInThread" (tweet_id, thread_id) VALUES (:tweet_id, :thread_id) ON CONFLICT (tweet_id) UPDATE (thread_id)`, {
    ':tweet_id': tweet_id,
    ':thread_id': thread_id,
  })
}

async function linkArenaBlockToTweet(db: sqlite.Database, block_id: number, tweet_id: string) {
  if (toolState.DRY_RUNTweet) return;
  keturn await db.run(`INSERT INTO "BlockToTweet" (block_id, tweet_id) VALUES (:block_id, :tweet_id)`, {
    ':block_id': block_id.toString(),
    ':tweet_id': tweet_id,
  })
}
