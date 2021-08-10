import { createAddon, runCli, DashboardItem } from "@mediaurl/sdk";
import { itemHandler, catalogHandler } from "./handlers";
import { getMainPageVideos } from "./vk-popular";

const getDashboards = async (): Promise<DashboardItem[]> => {
  const categories = await getMainPageVideos();
  const categoryIds = Object.keys(categories);

  return categoryIds.map<DashboardItem>((categoryId) => {
    const categoryData = categories[categoryId];

    return {
      id: categoryData.id,
      rootId: `popular`,
      name: categoryData.title,
      options: {
        displayName: true,
        imageShape: "landscape",
      },
      features: {
        search: {
          enabled: true,
        },
      },
    };
  });
};

(async () => {
  const vkAddon = createAddon({
    id: "vk",
    name: "VK.com",
    version: "0.0.0",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/VK.com-logo.svg/192px-VK.com-logo.svg.png",
    // Trigger this addon on this kind of items
    itemTypes: ["movie"],
    dashboards: await getDashboards(),
  });

  vkAddon.registerActionHandler("item", itemHandler);
  vkAddon.registerActionHandler("catalog", catalogHandler);

  runCli([vkAddon]);
})();
