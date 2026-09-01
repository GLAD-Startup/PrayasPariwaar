import { NativeModules, Platform } from "react-native";

function isImagePickerNativeModuleAvailable(): boolean {
  try {
    const globalObj = globalThis as any;
    if (globalObj?.expo?.modules?.ExponentImagePicker) return true;
    if (globalObj?.ExpoModules?.ExponentImagePicker) return true;
    if (NativeModules?.ExponentImagePicker) return true;
    if ((NativeModules as any)?.NativeModulesProxy?.ExponentImagePicker) return true;
    return false;
  } catch {
    return false;
  }
}

export async function pickImageFromGallery(): Promise<{
  uri?: string;
  error?: string;
  nativeUnavailable?: boolean;
}> {
  // If native module is not registered in the binary, do not invoke require() to prevent Hermes crash
  if (!isImagePickerNativeModuleAvailable()) {
    return {
      error: "Native camera roll module is not compiled into the current development build.",
      nativeUnavailable: true,
    };
  }

  try {
    let ImagePicker: any = null;
    try {
      ImagePicker = require("expo-image-picker");
    } catch (e: any) {
      return {
        error: "Native ImagePicker module not bundled.",
        nativeUnavailable: true,
      };
    }

    if (!ImagePicker || typeof ImagePicker.launchImageLibraryAsync !== "function") {
      return {
        error: "Image picker is not available in current client build.",
        nativeUnavailable: true,
      };
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return { error: "Permission to access photo gallery was denied." };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return { uri: result.assets[0].uri };
    }
    return {};
  } catch (e: any) {
    console.log("[ImagePicker Safe Warning]", e?.message);
    return { error: e?.message || "Failed to pick image", nativeUnavailable: true };
  }
}

export async function captureImageWithCamera(): Promise<{
  uri?: string;
  error?: string;
  nativeUnavailable?: boolean;
}> {
  if (!isImagePickerNativeModuleAvailable()) {
    return {
      error: "Native camera module is not compiled into the current development build.",
      nativeUnavailable: true,
    };
  }

  try {
    let ImagePicker: any = null;
    try {
      ImagePicker = require("expo-image-picker");
    } catch (e: any) {
      return {
        error: "Native Camera module not bundled.",
        nativeUnavailable: true,
      };
    }

    if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== "function") {
      return {
        error: "Camera is not available in current client build.",
        nativeUnavailable: true,
      };
    }

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return { error: "Permission to access camera was denied." };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return { uri: result.assets[0].uri };
    }
    return {};
  } catch (e: any) {
    console.log("[Camera Safe Warning]", e?.message);
    return { error: e?.message || "Failed to capture image", nativeUnavailable: true };
  }
}
