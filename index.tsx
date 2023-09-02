import Arena from "are.na";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import InfiniteScroll from 'react-infinite-scroller';
import { getBlocksToPost, arenaClient, ARENA_USER } from "./lib";

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
    bodyImageUrl: arenaBlock.image.display.url,
    profileName: arenaBlock.user.username,
    bodyText: (<div>
      ${`${arenaBlock.title}:\n${arenaBlock.description}`}
      <br/>
      <a
        href={arenaBlock.source.url}
        style={{ color: 'blue', textDecoration: 'underline' }}>
          {arenaBlock.source.url}
      </a>
    </div>),
    commentCount: arenaBlock.comment_count,
    commentPreview: {
      profileName: "",
      text: ""
    },
    postDate: new Date(
      arenaBlock?.connections?.[0]?.updated_at || arenaBlock.created_at
    ),
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
}: Content) => (
  <div className=" rounded overflow-hidden border w-full lg:w-6/12 md:w-6/12 bg-white mx-3 md:mx-0 lg:mx-0">
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
  const [channels, setChannels] = useState(null);
  const [blocks, setBlocks] = useState(null);

  const DEFAULT = {
    start: new Date("2023/08/01"),
    end: new Date("2023/08/31")
  }
  const [start, setStart] = useState(DEFAULT.start);
  const [end, setEnd] = useState(DEFAULT.end);

  console.log("ARGS", { start, end });

  useEffect(() => {
    console.log("EFFECT");
    // React advises to declare the async function directly inside useEffect
    async function getChannelsAndBlocks() {
      const channels = await arenaClient.user(ARENA_USER.id).channels();
      console.log(
        "ARENA channels resp",
        channels?.map((c: Arena.Channel) => c.title),
        channels?.length
      );
      const { blocksToTweet, allChannelNames } = await getBlocksToPost(
        channels,
        start,
        end
      );
      setChannels(allChannelNames);
      setBlocks(Object.values(blocksToTweet));
    }
    // You need to restrict it at some point
    if (!channels || !blocks) {
      console.log("GETTING CHANNELS & BLOCKS");
      getChannelsAndBlocks();
    }
  }, [start, end]);
  if (blocks && arenaToContentBlock) {
    console.log({
      block1: blocks?.[0],
      content1: arenaToContentBlock(blocks?.[0]),
      channels,
    });
  }
  return (
    <div>
      <label htmlFor="startdate">Start:</label>
      <input type="datetime-local" id="startdate" name="startdate" onChange={event => setStart(new Date(event.target.value))}/>
      <label htmlFor="enddate">End:</label>
      <input type="datetime-local" id="enddate" name="enddate" onChange={event => setEnd(new Date(event.target.value))}/>

      <div className={"arena-blocks flex flex-row"}>
        <div className={"w-1/2"} style={{height:'75%',overflow:'auto'}}>
          <InfiniteScroll
              pageStart={0}
              loadMore={() => {}}
              hasMore={true || false}
              loader={<div className="loader" key={0}>Loading ...</div>}
              useWindow={false}
          >
            {blocks?.map((block: Arena.Block) =>
              (<ContentBlock {...arenaToContentBlock(block)} />)
            )}
            </InfiniteScroll>
        </div>
        <div className={"debug-state w-1/2"}>
          <details>
            <summary>
              <p>STATE</p>
            </summary>
            <code>
            ${JSON.stringify({ blocks, channels }, null, 2)}
            </code>
          </details>
        </div>
      </div>
      {`STATE:
    `}
    </div>
  );
};

const App = () => <HomePage />;

const root = createRoot(document.getElementById("app"));

root.render(<App />);
