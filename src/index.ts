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
};

(async () => {
  const vkAddon = createWorkerAddon({
    id: "vk",
    name: "VK.com",
    version: "0.0.0",
    icon:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/VK.com-logo.svg/192px-VK.com-logo.svg.png",
    // Trigger this addon on this kind of items
    itemTypes: ["movie"],
    defaultDirectoryOptions: {
      displayName: true,
      imageShape: "landscape",
    },
    defaultDirectoryFeatures: {
      search: { enabled: true },
    },
    dashboards: await getDashboards(),
  });

  vkAddon.registerActionHandler("item", itemHandler);
  vkAddon.registerActionHandler("directory", directoryHandler);

  runCli([vkAddon]);
})();
