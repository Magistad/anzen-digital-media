/** Official Steam art and store URLs for games we cover. */
export type SteamGame = {
  appId: string;
  name: string;
  storeUrl: string;
  capsuleUrl: string;
  capsuleWidth: number;
  capsuleHeight: number;
};

export const ROB_RUN: SteamGame = {
  appId: "4262460",
  name: "ROB RUN",
  storeUrl: "https://store.steampowered.com/app/4262460/ROB_RUN/",
  // Official Steam header art from the store API (header_image).
  capsuleUrl:
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4262460/db8e0cf43c9475b96fb9446b4908de79fcb9f619/header.jpg",
  capsuleWidth: 460,
  capsuleHeight: 215,
};

export function steamGameByAppId(appId: string): SteamGame | undefined {
  if (appId === ROB_RUN.appId) return ROB_RUN;
  return undefined;
}
