import { headers } from "next/headers";
import { HubNav } from "./hub/HubNav";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../lib/native-shell";

export function SiteNav() {
  const hideServices = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  return (
    <header className="hub-nav">
      <HubNav hideServices={hideServices} />
    </header>
  );
}
