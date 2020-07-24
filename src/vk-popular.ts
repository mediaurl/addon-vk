import fetch from "node-fetch";
import { extractVideosMainPage } from "./vk.service";

const mainHtml = fetch("https://vk.com/video", {
  headers: {
    "accept-language": `ru`,
  },
}).then((resp) => resp.textConverted());

export const mainPageVideos = async () => {
  return extractVideosMainPage(await mainHtml).catVideosList;
};
