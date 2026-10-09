export type DeviceKind =
  "iphone" | "ipad" | "macbook" | "imac" | "android-phone" | "android-tablet" | "monitor";

export type DetectedDevice = {
  kind: DeviceKind;
  label: string;
};

type Size = { short: number; long: number };

const IPHONE_MODELS: Array<{ short: number; long: number; label: string }> = [
  { short: 320, long: 568, label: "iPhone SE" },
  { short: 375, long: 667, label: "iPhone SE" },
  { short: 375, long: 812, label: "iPhone 13 mini" },
  { short: 390, long: 844, label: "iPhone 16e" },
  { short: 393, long: 852, label: "iPhone 16" },
  { short: 402, long: 874, label: "iPhone 17 Pro" },
  { short: 414, long: 896, label: "iPhone 11" },
  { short: 428, long: 926, label: "iPhone 14 Plus" },
  { short: 430, long: 932, label: "iPhone 16 Plus" },
  { short: 440, long: 956, label: "iPhone 17 Pro Max" },
];

const IPAD_MODELS: Array<{ short: number; long: number; label: string }> = [
  { short: 744, long: 1133, label: "iPad mini" },
  { short: 768, long: 1024, label: "iPad" },
  { short: 810, long: 1080, label: "iPad" },
  { short: 820, long: 1180, label: "iPad Air" },
  { short: 834, long: 1112, label: "iPad Air" },
  { short: 834, long: 1194, label: "iPad Pro 11" },
  { short: 1024, long: 1366, label: "iPad Pro 12,9" },
  { short: 1032, long: 1376, label: "iPad Pro 13" },
];

const MACBOOK_MODELS: Array<{ short: number; long: number; label: string }> = [
  { short: 900, long: 1440, label: "MacBook Air 13" },
  { short: 956, long: 1470, label: "MacBook Air 13" },
  { short: 982, long: 1512, label: "MacBook Pro 14" },
  { short: 1117, long: 1728, label: "MacBook Pro 16" },
  { short: 1200, long: 1920, label: "MacBook Pro" },
];

function closestLabel(
  size: Size,
  models: Array<{ short: number; long: number; label: string }>,
  maxDelta = 18,
) {
  let best: { label: string; delta: number } | null = null;
  for (const model of models) {
    const delta = Math.abs(model.short - size.short) + Math.abs(model.long - size.long);
    if (!best || delta < best.delta) best = { label: model.label, delta };
  }
  return best && best.delta <= maxDelta ? best.label : null;
}

function screenSize(): Size {
  const width = window.screen.width || window.innerWidth;
  const height = window.screen.height || window.innerHeight;
  return { short: Math.min(width, height), long: Math.max(width, height) };
}

function isTouchMac() {
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function androidModel(ua: string) {
  const match = ua.match(/Android [^;]*; ([^)]+)\)/i);
  if (!match?.[1]) return null;
  const raw = match[1].replace(/\s+Build\/.*$/i, "").trim();
  if (!raw || /^(wv|mobile|linux)$/i.test(raw)) return null;
  return raw;
}

export function detectDevice(): DetectedDevice {
  if (typeof window === "undefined") return { kind: "monitor", label: "Studio Display" };

  const ua = navigator.userAgent;
  const size = screenSize();
  const iPad = /iPad/.test(ua) || isTouchMac();
  const iPhone = /iPhone/.test(ua);
  const android = /Android/.test(ua);
  const mac = /Macintosh/.test(ua) && !iPad;
  const windows = /Windows/.test(ua);
  const phoneHint = /Mobile/.test(ua) || size.short <= 500;

  if (iPhone) {
    const label = closestLabel(size, IPHONE_MODELS, 24) ?? "iPhone";
    return { kind: "iphone", label };
  }

  if (iPad) {
    const label = closestLabel(size, IPAD_MODELS, 40) ?? "iPad";
    return { kind: "ipad", label };
  }

  if (android) {
    const model = androidModel(ua);
    if (!phoneHint && size.short >= 600) {
      return { kind: "android-tablet", label: model ?? "Tablet" };
    }
    return { kind: "android-phone", label: model ?? "Android" };
  }

  if (mac) {
    const laptop = closestLabel(size, MACBOOK_MODELS, 80);
    if (laptop) return { kind: "macbook", label: laptop };
    if (size.long >= 2000) return { kind: "imac", label: "Studio Display" };
    if (size.long >= 1680 && size.short >= 1050) return { kind: "imac", label: "iMac" };
    return { kind: "macbook", label: "MacBook" };
  }

  if (windows || size.long >= 1280) {
    if (phoneHint) return { kind: "android-phone", label: "Smartphone" };
    return { kind: "monitor", label: "Monitor" };
  }

  if (phoneHint) return { kind: "android-phone", label: "Smartphone" };
  return { kind: "monitor", label: "Monitor" };
}

export function deviceZoom(kind: DeviceKind) {
  if (kind === "iphone" || kind === "android-phone") return 4.6;
  if (kind === "ipad" || kind === "android-tablet") return 3.2;
  if (kind === "macbook") return 3.5;
  return 3.4;
}
