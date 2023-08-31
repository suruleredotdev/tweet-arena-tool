import * as React from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route } from 'react-router-dom';

type Content = {
  profileImageUrl: string,
  profileName: string,
  bodyImageUrl: string,
  bodyText: string,
  commentCount: number,
  commentPreview: {
    profileName: string,
    text: string,
  },
}

const MOCK_CONTENT: Content  = {
  profileImageUrl: "https://avatars0.githubusercontent.com/u/38799309?v=4",
  bodyImageUrl: "https://3.bp.blogspot.com/-Chu20FDi9Ek/WoOD-ehQ29I/AAAAAAAAK7U/mc4CAiTYOY8VzOFzBKdR52aLRiyjqu0MwCLcBGAs/s1600/DSC04596%2B%25282%2529.JPG",
  profileName: "profile name",
  bodyText: "Lord of the Rings is my favorite film-series. One day I'll make my way to New Zealand to visit the Hobbiton set!",
  commentCount: 14,
  commentPreview: {
    profileName: "",
    text: "",
  }
}

const ContentBlock = ({
  profileImageUrl,
  bodyImageUrl,
  profileName,
  bodyText,
  commentCount,
  commentPreview
}:Content) => (
  <div className=" rounded overflow-hidden border w-full lg:w-6/12 md:w-6/12 bg-white mx-3 md:mx-0 lg:mx-0">
    <div className="w-full flex justify-between p-3">
      <div className="flex">
        <div className="rounded-full h-8 w-8 bg-gray-500 flex items-center justify-center overflow-hidden">
          <img src={profileImageUrl} alt="profilepic"/>
        </div>
        <span className="pt-1 ml-2 font-bold text-sm">braydoncoyer</span>
      </div>
      <span className="px-2 hover:bg-gray-300 cursor-pointer rounded">
        <i className="fas fa-ellipsis-h pt-2 text-lg"></i>
      </span>
    </div>
    <img 
      className="w-full bg-cover"
      src={bodyImageUrl}
    >
    </img>
    <div className="px-3 pb-2">
      <div className="pt-2">
        <i className="far fa-heart cursor-pointer"></i>
        <span className="text-sm text-gray-400 font-medium">12 likes</span>
      </div>
      <div className="pt-1">
        <div className="mb-2 text-sm">
          <span className="font-medium mr-2">{profileName}</span> {bodyText}
        </div>
      </div>
      <div className="text-sm mb-2 text-gray-400 cursor-pointer font-medium">View all {commentCount} comments</div>
      <div className="mb-2">
        <div className="mb-2 text-sm">
          <span className="font-medium mr-2">{commentPreview.profileName}</span> {commentPreview.text}
        </div>
      </div>
    </div>
  </div>
);

const HomePage = () => (
  <div>
    <ContentBlock {...MOCK_CONTENT} />
  </div>
);

const App = () => (
  <Routes>
    <Route path="/" children={<HomePage />} />
  </Routes>
);

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
