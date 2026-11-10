import type { CapacitorConfig } from "@capacitor/cli";

const production = "https://anzendigitalmedia.com/closepath/sign-in";
const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim() || production;
const parsed = new URL(serverUrl);
const hosts = new Set<string>(["anzendigitalmedia.com", "*.anzendigitalmedia.com"]);
if (parsed.hostname !== "anzendigitalmedia.com") hosts.add(parsed.hostname);

const config: CapacitorConfig = {
  appId: "com.anzendigitalmedia.closepath",
  appName: "Closepath",
  webDir: "www",
  backgroundColor: "#070708",
  android: {
    appendUserAgent: "ClosepathNative/1 (android)",
    backgroundColor: "#070708",
  },
  ios: {
    appendUserAgent: "ClosepathNative/1 (ios)",
    backgroundColor: "#070708",
    contentInset: "automatic",
  },
  server: {
    url: serverUrl,
    cleartext: parsed.protocol === "http:",
    androidScheme: "https",
    errorPath: "offline.html",
    allowNavigation: [...hosts],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      launchFadeOutDuration: 200,
      backgroundColor: "#070708",
      showSpinner: false,
      androidScaleType: "CENTER",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#070708",
      overlaysWebView: false,
    },
  },
};

export default config;
