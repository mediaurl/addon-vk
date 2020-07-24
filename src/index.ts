import { createWorkerAddon, runCli, DashboardItem } from "@watchedcom/sdk";
import { itemHandler, directoryHandler } from "./handlers";
import { mainPageVideos } from "./vk-popular";

const getDashboards = async (): Promise<DashboardItem[]> => {
  const categories = await mainPageVideos();
  const categoryIds = Object.keys(categories);

  return categoryIds.map<DashboardItem>((categoryId) => {
    const categoryData = categories[categoryId];

    return {
      id: categoryData.id,
      rootId: `popular`,
      name: categoryData.title,
    };
  });

  for (const categoryId of Object.keys(categories)) {
    console.log({
      categoryId,
      title: categories[categoryId].title,
    });
  }
};

(async () => {
  const vkAddon = createWorkerAddon({
    id: "vk",
    name: "VK.com",
    version: "0.0.0",
    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=vk.com",
    // Trigger this addon on this kind of items
    itemTypes: ["movie"],
    defaultDirectoryOptions: {
      displayName: true,
    },
    dashboards: await getDashboards(),
  });

  vkAddon.registerActionHandler("item", itemHandler);
  vkAddon.registerActionHandler("directory", directoryHandler);

  runCli([vkAddon]);
})();
