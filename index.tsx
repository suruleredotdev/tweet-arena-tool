import Arena from "are.na";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import InfiniteScroll from "react-infinite-scroller";
import {
  getBlocksToPost,
  arenaClient,
  ARENA_USER,
  fmtBlockAsTweet,
} from "./lib";

type Content = {
  profileImageUrl: string;
  profileName: string;
  bodyImageUrl: string;
  bodyText: string | React.ReactNode;
  commentCount: number;
  commentPreview: {
    profileName: string;
    text: string | React.ReactNode;
  };
  postDate: Date;
};

export interface RssFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  content_html: string;
  image: any;
  date_published: string;
  authors: Author[];
}

export interface Author {
  name: string;
}

const DEFAULT_ARGS = {
  start: new Date("2023/10/01"),
  end: new Date("2023/10/31"),
};

const MOCK_CONTENT: Content = {
  profileImageUrl: "https://avatars0.githubusercontent.com/u/38799309?v=4",
  bodyImageUrl:
    "https://3.bp.blogspot.com/-Chu20FDi9Ek/WoOD-ehQ29I/AAAAAAAAK7U/mc4CAiTYOY8VzOFzBKdR52aLRiyjqu0MwCLcBGAs/s1600/DSC04596%2B%25282%2529.JPG",
  profileName: "profile name",
  bodyText:
    "Lord of the Rings is my favorite film-series. One day I'll make my way to New Zealand to visit the Hobbiton set!",
  commentCount: 14,
  commentPreview: {
    profileName: "",
    text: "",
  },
  postDate: new Date(),
};

function arenaToContentBlock(arenaBlock: Arena.Block): Content {
  if (!arenaBlock) return MOCK_CONTENT;
  return {
    profileImageUrl: arenaBlock.user.avatar,
    bodyImageUrl: arenaBlock?.image?.display?.url || "",
    profileName: arenaBlock.user.username,
    bodyText: (
      <div>
        {`${arenaBlock.title}:\n${arenaBlock.description}`}
        <br />
        <a
          href={arenaBlock.source?.url || ""}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {arenaBlock.source?.url || ""}
        </a>
      </div>
    ),
    commentCount: arenaBlock.comment_count,
    commentPreview: {
      profileName: "",
      text: "",
    },
    postDate: new Date(
      arenaBlock?.connections?.[0]?.updated_at || arenaBlock.created_at
    ),
  };
}

function rssToContentBlock(feedItem: RssFeedItem): Content {
  if (!feedItem) return MOCK_CONTENT;
  return {
    profileImageUrl: "", // feedItem.author.avatar,
    bodyImageUrl: feedItem.image || "",
    profileName: feedItem.authors?.[0].name || "",
    bodyText: (
      <div>
        {`${feedItem.title}:\n${feedItem.content_text}`}
        <br />
        <a
          href={feedItem.url}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {feedItem.url}
        </a>
      </div>
    ),
    commentCount: 0,
    commentPreview: {
      profileName: "",
      text: "",
    },
    postDate: new Date(feedItem.date_published),
  };
}

const ContentBlock = ({
  profileImageUrl,
  bodyImageUrl,
  profileName,
  bodyText,
  // commentCount,
  // commentPreview,
  postDate,
  key,
  onClick,
}: Content & { key: string; onClick?: (e: any) => void }) => (
  <div
    id={key}
    className=" rounded overflow-hidden border w-full lg:w-3/4 md:w-3/4 bg-white mx-3 md:mx-0 lg:mx-0"
    onClick={onClick || (() => {})}
  >
    <div className="w-full flex justify-between p-3">
      <div className="flex">
        <div className="rounded-full h-8 w-8 bg-gray-500 flex items-center justify-center overflow-hidden">
          <img src={profileImageUrl} alt="profilepic" />
        </div>
        <span className="pt-1 ml-2 font-bold text-sm">{profileName}</span>
      </div>
      <span className="px-2 hover:bg-gray-300 cursor-pointer rounded">
        <i className="fas fa-ellipsis-h pt-2 text-lg"></i>
      </span>
    </div>
    <img className="w-full bg-cover" src={bodyImageUrl}></img>
    <div className="px-3 pb-2">
      <div className="pt-2">
        <i className="far fa-heart cursor-pointer"></i>
        <span className="text-sm text-gray-400 font-medium">
          {postDate.toLocaleString()}
        </span>
      </div>
      <div className="pt-1">
        <div className="mb-2 text-sm">
          <span className="font-medium mr-2">{profileName}</span> {bodyText}
        </div>
      </div>
      {/* TODO: support comments
      <div className="text-sm mb-2 text-gray-400 cursor-pointer font-medium">
        View all {commentCount} comments
      </div>
      <div className="mb-2">
        <div className="mb-2 text-sm">
          <span className="font-medium mr-2">{commentPreview.profileName}</span>{" "}
          {commentPreview.text}
        </div>
      </div>
      */}
    </div>
  </div>
);

const HomePage = () => {
  const [channels, setChannels] = useState([]);
  const [blocks, setBlocks] = useState<Record<string, Arena.Block>>({});
  const [tweets, setTweets] = useState<RssFeedItem[]>([]);
  const [start, setStart] = useState(DEFAULT_ARGS.start);
  const [end, setEnd] = useState(DEFAULT_ARGS.end);

  const [toggleRowCol, setToggleRowCol] = useState<"row" | "col">("row");

  const BLOCK_LIMIT = 25;

  console.log("ARGS", { start, end });

  // load Are.na content
  useEffect(() => {
    console.log("EFFECT");
    // React advises to declare the async function directly inside useEffect
    async function loadChannelsAndBlocks() {
      const channels = await arenaClient.user(ARENA_USER.id).channels();
      setChannels(channels);
      console.log(
        "ARENA channels resp",
        channels?.map((c: Arena.Channel) => c.title),
        channels?.length
      );
      const { blocksToTweet } = await getBlocksToPost(
        channels,
        start,
        end
      );
      const blockTitlesToId = Object.fromEntries(
        Object.values(blocksToTweet)?.map((b: Arena.Block) => [b.title, b.id])
      );
      console.log("blockTitles to ID", {
        blockTitlesToId,
      });
      setBlocks(blocksToTweet);
    }

    async function filterLoadedBlocks() {
      const { blocksToTweet } = await getBlocksToPost(
        channels,
        start,
        end
      );
      setBlocks(blocksToTweet);
    }

    // You need to restrict it at some point
    if (!channels?.length || !Object.keys(blocks)?.length) {
      console.log("GETTING CHANNELS & BLOCKS");
      loadChannelsAndBlocks();
    } else {
      filterLoadedBlocks();
    }
  }, [start, end]);
  if (blocks?.length && arenaToContentBlock) {
    console.log({
      block1: blocks?.[0],
      content1: arenaToContentBlock(blocks?.[0]),
      channels,
    });
  }

  // load Twitter content via RSS feed
  const TWITTER_FEED_RSS_URL =
    "https://rss.app/feeds/v1.1/cDaks50fS2vLZRo3.json";
  useEffect(() => {
    async function getTwitterFeed() {
      console.log({ TWITTER_FEED_RSS_URL });
      const response = await fetch(TWITTER_FEED_RSS_URL + "?hl=en&n=200");
      const jsonBody = await response.json();
      if (!jsonBody?.items) {
        return;
      }
      for (const rssTweet of jsonBody?.items) {
        setTweets((oldTweets: any[]) => [...oldTweets, rssTweet]);
      }
    }
    if (!tweets?.length) {
      console.log("GETTING TWITTER FEED");
      getTwitterFeed();
    }
  });
  if (tweets) {
    console.log({
      tweets,
      tweet1to5: tweets?.slice(0, 5),
      numTweets: tweets?.length,
    });
  }

  function getTweetIdFromUrl(url: string) {
    const parts = url?.split("/");
    return parts?.[parts.length - 1] || "";
  }

  const TWEET_INTENT_URL = `https://twitter.com/intent/tweet?text=`;

  const panelClasses = toggleRowCol === "col" ? "flex-col w-1/2" : "flex-row h-1/2"
  return (
    <div className={"app-body"}>
      <div
        className={`app-settings flex ${panelClasses}`}
        style={{ height: "75%", overflow: "auto" }}
      >
        <label htmlFor="startdate">Start:</label>
        <input
          type="datetime-local"
          id="startdate"
          name="startdate"
          value={start.toISOString().slice(0,16)}
          onInput={(event) => {
            const value = (event.target as HTMLInputElement).value
            console.log("input.change:setStartDate", value)
            setStart(new Date(value))
          }}
        />

        <label htmlFor="enddate">End:</label>
        <input
          type="datetime-local"
          id="enddate"
          name="enddate"
          value={end.toISOString().slice(0,16)}
          onInput={(event) => {
            const value = (event.target as HTMLInputElement).value
            console.log("input.change:setEndDate", value);
            setEnd(new Date(value));
          }}
        />
      </div>

      <div className={"flex flex-row "}>
        <div
          className={"arena-blocks w-1/3 flex flex-row space-y-4"}
          style={{ height: "75%", overflow: "auto" }}
        >
          <h2>ARE.NA</h2>
          {/* TODO: answer: do we really need infinite scroll rn, fully implement
            pagination withb loadMore
          `*/}
          <InfiniteScroll
            pageStart={0}
            loadMore={() => {}}
            hasMore={true || false}
            loader={
              <div className="loader" key={0}>
                Loading ...
              </div>
            }
            useWindow={false}
          >
            {Object.values(blocks)
              .slice(0, BLOCK_LIMIT)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((block: Arena.Block) => {
              const data = arenaToContentBlock(block);
              return (
                <ContentBlock
                  {...data}
                  key={"block-" + block.id}
                  onClick={(_) => {
                    window.open(
                      TWEET_INTENT_URL +
                        encodeURIComponent(fmtBlockAsTweet(block))
                    );
                  }}
                />
              );
            })}
          </InfiniteScroll>
        </div>

        <div
          className={"rss-tweets w-1/3 flex flex-col space-y-4"}
          style={{ height: "75%", overflow: "auto" }}
        >
          <h2 className={""}>TWITTER</h2>
          {tweets?.map((tweet: RssFeedItem) => (
            <ContentBlock
              {...rssToContentBlock(tweet)}
              key={"tweet-" + getTweetIdFromUrl(tweet.url)}
            />
          ))}
        </div>

        <div className={"debug-state w-1/3"}>
          <h2>STATE</h2>
          <details>
            <summary>
              <h2>ARE.NA</h2>
            </summary>

            <code>
              {JSON.stringify(
                { blocks: Object.values(blocks), channels },
                null,
                2
              )}
            </code>
          </details>
          <details>
            <summary>
              <h2>TWITTER</h2>
            </summary>

            <code>{JSON.stringify({ tweets }, null, 2)}</code>
          </details>
        </div>
      </div>
    </div>
  );
};

const App = () => <HomePage />;

const root = createRoot(document.getElementById("app"));

root.render(<App />);
