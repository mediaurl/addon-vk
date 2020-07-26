import fetch from "node-fetch";
import { extractVideosMainPage } from "./vk.service";
import ms from "ms";

let mainHtml: Promise<string>;
let lastUpdated: number;

const DASHBOARD_TTL = ms(process.env.DASHBOARD_TTL || "3 minutes");

const updateHtml = () => {
  lastUpdated = +new Date();
  mainHtml = fetch("https://vk.com/video", {
    headers: {
      "accept-language": `ru`,
    },
  }).then((resp) => resp.textConverted());
};

export const getMainPageVideos = async () => {
  if (!lastUpdated || +new Date() - lastUpdated > DASHBOARD_TTL) {
    updateHtml();
  }

  return extractVideosMainPage(await mainHtml).catVideosList;
};
