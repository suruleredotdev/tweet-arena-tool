"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var twitter_api_v2_1 = require("twitter-api-v2");
var are_na_1 = require("are.na");
var tool_config_json_1 = require("./tool-config.json");
assert;
{
    type: "json";
}
;
var LOG_LEVEL = process.env.LOG_LEVEL || "ERROR";
var DRY_RUN = Boolean(process.env.LOG_LEVEL) || tool_config_json_1["default"].dryRunTweet;
var twitterClient = new twitter_api_v2_1.TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET
});
exports.ARENA_USER = {
    slug: "korede-aderele",
    id: 60392,
    token: process.env.ARENA_PERSONAL_ACCESS_TOKEN
};
exports.arenaClient = new are_na_1["default"]({ accessToken: exports.ARENA_USER.token });
var ARENA_CHANNELS = [
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
function tweet(_a) {
    var text = _a.text, reply = _a.reply, media = _a.media, args = __rest(_a, ["text", "reply", "media"]);
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!DRY_RUN) return [3 /*break*/, 1];
                    console.log("TWEET*", {
                        text: text,
                        reply: reply,
                        media: media,
                        textLen: text.length,
                        textOver280: text ? .length > 280 : 
                    });
                    return [2 /*return*/, { data: __assign({ id: "TEST-REPLY-ID" }, args), errors: [] }];
                case 1:
                    if (!reply) return [3 /*break*/, 3];
                    return [4 /*yield*/, twitterClient.v2.reply(text, reply)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, twitterClient.v2.tweet(text)];
                case 4: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
function getArgs() {
    var rawCliArgs = {}, acc = [];
    for (var _i = 0, _a = process.argv; _i < _a.length; _i++) {
        var curr = _a[_i];
        if (acc.length === 0)
            continue;
        var argKey = acc[acc.length - 1];
        switch (argKey) {
            case "blockIds":
                rawCliArgs[acc[acc.length - 1]] = JSON.parse(curr);
                break;
            default:
                break;
        }
    }
    var postNewBlocksSince = new Date(tool_config_json_1["default"].postNewBlocksSince);
    if (!postNewBlocksSince) {
        console.error("missing toolConfig.postNewBlocksSince", tool_config_json_1["default"]);
    }
    var postNewBlocksTill = "postNewBlocksTill" in rawCliArgs
        ? new Date(rawCliArgs["postNewBlocksTill"])
        : "postNewBlocksTill" in tool_config_json_1["default"]
            ? new Date(tool_config_json_1["default"]["postNewBlocksTill"])
            : new Date();
    return {
        postNewBlocksSince: postNewBlocksSince,
        postNewBlocksTill: postNewBlocksTill,
        blockIds: new Array(rawCliArgs["blockIds"])
    };
}
// const LOG_LEVELS = ["INFO", "DEBUG", "ERROR"];
//
// function log(level, ...args) {
//   if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(level)) {
//     console[level || "log"](...args);
//   }
// }
function getBlocksToPost(channels, postNewBlocksTill, postNewBlocksSince) {
    return __awaiter(this, void 0, void 0, function () {
        var blocksToTweet, allChannelNames, blockChannelsMap, i, channel, j, block, block_connected_date;
        return __generator(this, function (_a) {
            blocksToTweet = {};
            allChannelNames = new Set();
            blockChannelsMap = {};
            // const db = await openDb();
            try {
                console.log("ARENA channels resp 0", channels[0]);
                console.log("> channels loop start");
                for (i = 0; i < channels.length; i++) {
                    console.log(">> channels iter " + i);
                    channel = channels[i];
                    if (!ARENA_CHANNELS.includes(channel.title))
                        continue;
                    if (!channel.contents) {
                        if (LOG_LEVEL === "DEBUG")
                            console.log("Skipping channel idx " + i + " due to empty contents");
                        continue;
                    }
                    console.log(">> blocks loop start");
                    for (j = 0; j < channel.contents ? .length : ; j++) {
                        console.log(">>> blocks iter " + j + " start", {
                            channel_name: channel.title
                        });
                        block = channel.contents[j];
                        block_connected_date = new Date(Math.min.apply(null, [
                            new Date(block ? .connections[0] ? .created_at :  : ),
                            new Date(block ? .connections[0] ? .created_at :  : ),
                        ]));
                        console.log(">>> considering block #" + block.id + " \"" + block.title + "\" to post, in date range SINCE:" + (postNewBlocksSince ? .toDateString() : ) + " < " + block_connected_date + " <= TILL:" + (postNewBlocksTill ? .toDateString() : ));
                        if (block_connected_date > postNewBlocksSince &&
                            block_connected_date <= postNewBlocksTill) {
                            console.log(">>>> adding block to post, since in date range");
                            blocksToTweet[block.id] = block;
                            if (block.id in blockChannelsMap) {
                                blockChannelsMap[block.id].add(channel.title);
                            }
                            else {
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
                                ? .slice(0, 5)
                                    .map(function (block) { return block.title; }) : 
                        });
                }
                console.log("ARENA", blocksToTweet);
                if (LOG_LEVEL === "DEBUG")
                    console.log("ARENA", blocksToTweet, blockChannelsMap);
            }
            catch (err) {
                console.error("ARENA ERR", err);
            }
            finally {
                return [2 /*return*/, {
                        blocksToTweet: blocksToTweet,
                        allChannelNames: allChannelNames
                    }];
            }
            return [2 /*return*/];
        });
    });
}
exports.getBlocksToPost = getBlocksToPost;
function fmtBlockAsTweet(block) {
    var MAX_TITLE_LEN = 75;
    var MAX_DESC_LEN = 140 - (block.source ? .url ? .length || 0 :  : );
    return ("" + (block.title ? .slice(0, MAX_TITLE_LEN) + ":\n" || "" : ) + (block.description ? .slice(0, MAX_DESC_LEN) || ""
        :
    ) + (block.description ? .length > MAX_DESC_LEN ? "..." : "" : ) + "\n\nContext: https://are.na/block/" + block.id + "\nSource: " + (block.source ? .url : ) + "\n").trim();
}
function tweetThreadFromBlocks(blocksToTweetList, allChannelNames) {
    return __awaiter(this, void 0, void 0, function () {
        var threadHeaderContent, _a, data, errors, replyToId, _i, blocksToTweetList_1, arenaBlock, _b, tweetData, errors_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    threadHeaderContent = ("\nResearch Update \uD83E\uDDF5 " + new Date().toDateString() + ": " + (blocksToTweetList ? .length || "a # of "
                        :
                    ) + " recently collected links by category\n\nCategories include " + Array.from(allChannelNames).join(", ") + "\n").trim();
                    return [4 /*yield*/, tweet({
                            text: threadHeaderContent
                        })];
                case 1:
                    _a = _c.sent(), data = _a.data, errors = _a.errors;
                    console.log({
                        data: data,
                        errors: errors,
                        tweetLink: "https://twitter.com/suruleredotdev/status/" + (data ? .id : )
                    });
                    if (errors ? .length : ) {
                        console.error("TWEET ERR", errors);
                        return [2 /*return*/];
                    }
                    replyToId = data ? .id : ;
                    _i = 0, blocksToTweetList_1 = blocksToTweetList;
                    _c.label = 2;
                case 2:
                    if (!(_i < blocksToTweetList_1.length)) return [3 /*break*/, 5];
                    arenaBlock = blocksToTweetList_1[_i];
                    return [4 /*yield*/, tweet({
                            text: fmtBlockAsTweet(arenaBlock),
                            reply: replyToId,
                            media: null,
                            connected_at: arenaBlock ? .connections[0] ? .updated_at :  : 
                        })];
                case 3:
                    _b = _c.sent(), tweetData = _b.data, errors_1 = _b.errors;
                    if (LOG_LEVEL === "DEBUG")
                        console.log({ tweetData: tweetData, errors: errors_1 });
                    if (errors_1 ? .length : ) {
                        console.error("TWEET ERR", errors_1);
                        return [2 /*return*/];
                    }
                    /*
                    await saveTweetInThread(db, tweetData?.id, arenaBlock.source.url)
                    await linkArenaBlockToTweet(db, arenaBlock?.id, tweetData?.id)
                    */
                    replyToId = tweetData ? .id : ;
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function runMain() {
    return __awaiter(this, void 0, void 0, function () {
        var args, postNewBlocksSince, postNewBlocksTill, channels, _a, blocksToTweet, allChannelNames, blocksToTweetList;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    args = getArgs();
                    console.log("ARGS", args);
                    postNewBlocksSince = args.postNewBlocksSince, postNewBlocksTill = args.postNewBlocksTill;
                    return [4 /*yield*/, exports.arenaClient.user(exports.ARENA_USER.id).channels()];
                case 1:
                    channels = _b.sent();
                    console.log("ARENA channels resp", channels ? .map(function (c) { return c.title; }) : , channels ? .length
                        :
                    );
                    return [4 /*yield*/, getBlocksToPost(channels, postNewBlocksSince, postNewBlocksTill)];
                case 2:
                    _a = _b.sent(), blocksToTweet = _a.blocksToTweet, allChannelNames = _a.allChannelNames;
                    blocksToTweetList = Object.values(blocksToTweet);
                    if (blocksToTweetList.length === 0) {
                        console.info("No blocks to post this time :/");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, tweetThreadFromBlocks(blocksToTweetList, allChannelNames)];
                case 3:
                    _b.sent();
                    console.log("new lastRunTime: ", new Date().toISOString());
                    return [2 /*return*/];
            }
        });
    });
}
runMain();
