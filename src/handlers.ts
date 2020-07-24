import { WorkerHandlers, MovieItem } from "@watchedcom/sdk";
import { mainPageVideos } from "./vk-popular";

export const itemHandler: WorkerHandlers["item"] = async (input, ctx) => {
  console.log("item", input);
  throw new Error("Not implemented");
};

export const directoryHandler: WorkerHandlers["directory"] = async (
  input,
  ctx
) => {
  console.log("directory", input);
  if (input.rootId === "popular") {
    return {
      nextCursor: null,
      items: (await mainPageVideos())[input.id].list.map<MovieItem>((_) => {
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
  }

  throw new Error("Not implemented");
};
