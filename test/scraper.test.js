const fetch = require("node-fetch");
const { extractVideosMainPage } = require("../dist/vk.service");

test("scraper", async () => {
  const resp = await fetch("https://vk.com/video", {
    headers: {
      accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
      "accept-encoding": `gzip, deflate, br`,
      "accept-language": `ru;q=0.9,en-US,en;q=0.8`,
      "user-agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.38 Safari/537.36`,
    },
  });

  const result = extractVideosMainPage(await resp.textConverted());

  const categories = result.catVideosList;

  for (const categoryId of Object.keys(categories)) {
    console.log({
      categoryId,
      title: categories[categoryId].title,
    });
  }

  expect(Object.keys(categories).length > 0).toBeTruthy();
});
