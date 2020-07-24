import * as fs from "fs";

const payloadRegex = /extend\(cur, (.*)\);/;

export const extractVideosMainPage = (
  html: string
): {
  catVideosList: {
    [categoryId: string]: {
      id: string;
      title: string;
      list: {
        vid: string;
        title: string;
        thumb: string;
      }[];
    };
  };
} => {
  const result = payloadRegex.exec(html);

  if (result && result[1]) {
    return JSON.parse(result[1]);
  }

  throw new Error("Unable to extract videos data");
};
