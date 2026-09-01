import { Asset } from "expo-asset";
import { Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { api } from "./api";
import { setCachedData } from "./cache";

// Keep native splash screen visible while assets & initial state load
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore in web or unsupported environments
}

export const CORE_IMAGE_ASSETS = [
  require("../assets/images/prayas-logo.png"),
  require("../assets/images/prayas-logo-blue.png"),
  require("../assets/images/hero-education-vrindavan.jpg"),
  require("../assets/images/banyan-study-vrindavan.jpg"),
  require("../assets/images/vrindavan-plantation.jpg"),
  require("../assets/images/health-camp-vrindavan.jpg"),
  require("../assets/images/youth-skills-vrindavan.jpg"),
  require("../assets/images/child-hero-portrait.jpg"),
  require("../assets/images/child-hope-vrindavan.jpg"),
  require("../assets/images/medical-blood-seva.jpg"),
  require("../assets/onboarding/classroom.jpg"),
  require("../assets/onboarding/blood.jpg"),
  require("../assets/onboarding/plantation.jpg"),
  require("../assets/onboarding/jeev_jal.jpg"),
  require("../assets/onboarding/tailoring.jpg"),
  require("../assets/onboarding/education.jpg"),
  require("../assets/onboarding/equipment.jpg"),
  require("../assets/onboarding/gallery_1.jpg"),
  require("../assets/onboarding/gallery_2.jpg"),
];

/**
 * Preloads all static assets and initial critical cache data
 * before the app or first screen renders.
 */
export async function preloadAppAssets(): Promise<void> {
  try {
    // 1. Preload static local image modules
    const assetPromises = CORE_IMAGE_ASSETS.map((asset) => {
      if (typeof asset === "number") {
        return Asset.fromModule(asset).downloadAsync();
      }
      return Promise.resolve();
    });

    // 2. Fetch initial critical datasets in parallel (Home, Projects, Posts)
    const dataPromises = [
      api.get("/projects").then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCachedData("prayas_projects", res.data.data);
        }
      }).catch(() => {}),
      api.get("/posts").then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCachedData("prayas_blog_posts", res.data.data);
        }
      }).catch(() => {}),
    ];

    // Wait for all assets and initial cache priming
    await Promise.allSettled([...assetPromises, ...dataPromises]);
  } catch (error) {
    console.warn("[AssetPreloader] Warning during asset warmup:", error);
  }
}

/**
 * Prefetches remote image URLs into fast memory cache
 */
export async function prefetchRemoteImages(urls: string[]): Promise<void> {
  const validUrls = urls.filter((u) => u && typeof u === "string" && u.startsWith("http"));
  const promises = validUrls.map((url) => Image.prefetch(url).catch(() => false));
  await Promise.allSettled(promises);
}

/**
 * Hides the splash screen once everything is loaded
 */
export async function hideSplashScreen(): Promise<void> {
  try {
    await SplashScreen.hideAsync();
  } catch (e) {
    // ignore
  }
}
