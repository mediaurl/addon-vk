import { WorkerHandlers, MovieItem, Source } from "@watchedcom/sdk";
import { VK, VideoVideo } from "vk-io";
import { getMainPageVideos } from "./vk-popular";

const token = process.env.TOKEN;

const vk = new VK({
  token,
  apiVersion: process.env.API_VERSION || "5.120",
});

const vkApi = vk.api;

const externalFileKeys = ["live", "hls", "external"];

const mapItem = (result: VideoVideo): MovieItem => {
  const id = `${result.owner_id}_${result.id}`;

  const externalOrLive = Object.keys(result.files).some(
    (_) => externalFileKeys.indexOf(_) !== -1
  );

  const sources: Source[] = (externalOrLive
    ? externalFileKeys
    : Object.keys(result.files || {})
  )
    .filter((label) => !!result.files[label])
    .map((qualityLabel) => {
      const url = result.files[qualityLabel];
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

export const directoryHandler: WorkerHandlers["directory"] = async (
  input,
  ctx
) => {
  console.log("directory", input);

  const category = input.id || "cat_featured";

  if (input.search) {
    const resp = await vkApi.video.search({
      q: input.search,
      adult: input.adult ? 1 : 0,
    });

    return {
      nextCursor: null,
      items: resp.items.map(mapItem),
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
