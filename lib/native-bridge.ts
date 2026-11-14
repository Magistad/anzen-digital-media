type NativeResult = Record<string, unknown>;

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  nativePromise?: (plugin: string, method: string, options?: Record<string, unknown>) => Promise<NativeResult>;
};

function bridge(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  const cap = (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor;
  if (!cap?.isNativePlatform?.() || !cap.nativePromise) return null;
  return cap;
}

export function nativeCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /cancel/i.test(message);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>);
  return [];
}

export function fileFromBase64(base64: string, name: string, type: string): File {
  const clean = base64.replace(/^data:[^,]*,/, "").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type });
}

async function callNative(plugin: string, method: string, options?: Record<string, unknown>): Promise<NativeResult> {
  const cap = bridge();
  if (!cap?.nativePromise) throw new Error("That action needs the Closepath app.");
  return cap.nativePromise(plugin, method, options);
}

export async function hideNativeChrome(): Promise<void> {
  if (!bridge()) return;
  await callNative("SplashScreen", "hide", {}).catch(() => undefined);
  await callNative("StatusBar", "setStyle", { style: "LIGHT" }).catch(() => undefined);
  await callNative("StatusBar", "setBackgroundColor", { color: "#070708" }).catch(() => undefined);
  await callNative("StatusBar", "setOverlaysWebView", { overlay: false }).catch(() => undefined);
}

export async function nativeShareDeal(title: string, text: string): Promise<void> {
  await callNative("Share", "share", { title, text, dialogTitle: "Share deal" });
}

export async function nativeAddCalendarEvent(event: {
  title: string;
  description: string;
  location: string;
  date: string;
}): Promise<void> {
  await callNative("ClosepathCalendar", "addEvent", event);
}

async function photoFrom(source: "CAMERA" | "PHOTOS"): Promise<File> {
  const result = await callNative("Camera", "getPhoto", {
    quality: 85,
    allowEditing: false,
    resultType: "base64",
    source,
    correctOrientation: true,
    saveToGallery: false,
    width: 2000,
  });
  const base64 = typeof result.base64String === "string" ? result.base64String : "";
  if (!base64) throw new Error("That photo didn’t come through.");
  const png = result.format === "png";
  return fileFromBase64(base64, `closepath-${Date.now()}.${png ? "png" : "jpg"}`, png ? "image/png" : "image/jpeg");
}

export function nativeTakePhoto(): Promise<File> {
  return photoFrom("CAMERA");
}

export function nativePickPhoto(): Promise<File> {
  return photoFrom("PHOTOS");
}

export async function nativePickPdf(): Promise<File> {
  const result = await callNative("FilePicker", "pickFiles", {
    types: ["application/pdf"],
    limit: 1,
    readData: true,
  });
  const first = asList(result.files)[0] as { name?: string; data?: string } | undefined;
  if (!first?.data) throw new Error("That PDF didn’t come through.");
  const name = typeof first.name === "string" && first.name.toLowerCase().endsWith(".pdf") ? first.name : "document.pdf";
  return fileFromBase64(first.data, name, "application/pdf");
}
