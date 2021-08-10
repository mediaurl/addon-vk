import { WorkerHandlers, MovieItem, Source } from "@mediaurl/sdk";
import { VK, Objects } from "vk-io";
import { getMainPageVideos } from "./vk-popular";

const token = process.env.TOKEN as string;
const pageCount = 20;

const vk = new VK({
  token,
  apiVersion: process.env.API_VERSION || "5.120",
});

const vkApi = vk.api;

const externalFileKeys = ["live", "hls", "external"];

const mapItem = (result: Objects.VideoVideoFull): MovieItem => {
  const id = `${result.owner_id}_${result.id}`;

  result.files = result.files || {};

  const externalOrLive = Object.keys(result.files).some(
    (_) => externalFileKeys.indexOf(_) !== -1
  );

  const sources: Source[] = (
    externalOrLive ? externalFileKeys : Object.keys(result.files)
  )
    .filter((label) => !!result.files?.[label])
    .map((qualityLabel) => {
      const url = result.files?.[qualityLabel];
      const [_, videoHeight] = qualityLabel.split("_");
      return {
        type: "url",
        name: ["VK.com", videoHeight ? `(${videoHeight}p)` : ""]
          .filter((_) => _)
          .join(" "),
        url,
        id: `${id}_${qualityLabel}`,
      };
    });

  return {
    type: "movie",
    ids: {
      id,
    },
    name: result.title,
    description: result.description,
    images: {
      poster: (result.image || []).slice(-1)[0].url,
    },
    sources: externalOrLive ? sources.slice(0, 1) : sources,
  };
};

export const itemHandler: WorkerHandlers["item"] = async (input, ctx) => {
  console.log("item", input);

  const resp = await vkApi.video.get({
    videos: input.ids.id as string,
  });

  const [result] = resp.items;

  if (!result) {
    throw new Error("Not found");
  }

  return mapItem(result);
};

export const catalogHandler: WorkerHandlers["directory"] = async (
  input,
  ctx
) => {
  console.log("directory", input);

  const category = input.id || "cat_featured";
  const offset = (input.cursor as number) || 0;

  if (input.search) {
    const resp = await vkApi.video.search({
      q: input.search,
      adult: input.adult ? 1 : 0,
      count: pageCount,
      offset,
    });

    return {
      nextCursor: offset + pageCount,
      items: (resp.items || []).map(mapItem),
    };
  }

  return {
    nextCursor: null,
    items: (await getMainPageVideos())[category].list.map<MovieItem>((_) => {
      return {
        type: "movie",
        ids: {
          id: _.vid,
        },
        images: {
          poster: _.thumb,
        },
        name: _.title,
      };
    }),
  };
};
