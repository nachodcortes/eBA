// src/utils/googleAuth.ts
import * as WebBrowser from "expo-web-browser";
import { API_URL } from "../config/api";

const limpiarVariable = (valor?: string) => {
  const limpio = valor?.trim();
  return limpio && limpio !== "undefined" ? limpio : undefined;
};

export const GOOGLE_CLIENT_ID = limpiarVariable(
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
);
export const GOOGLE_IOS_CLIENT_ID_CONFIGURED =
  limpiarVariable(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
export const GOOGLE_IOS_CLIENT_ID =
  GOOGLE_IOS_CLIENT_ID_CONFIGURED || GOOGLE_CLIENT_ID;
export const GOOGLE_ANDROID_CLIENT_ID_CONFIGURED =
  limpiarVariable(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
export const GOOGLE_ANDROID_CLIENT_ID =
  GOOGLE_ANDROID_CLIENT_ID_CONFIGURED || GOOGLE_CLIENT_ID;
export const GOOGLE_REDIRECT_URI = "https://auth.expo.io/@nattyy/eba";

WebBrowser.maybeCompleteAuthSession();

export const loginConGoogle = async () => {
  const result = await WebBrowser.openAuthSessionAsync(
    `${API_URL}/api/usuarios/auth/google`,
    "eba://auth"
  );
  
  console.log("Resultado Google:", JSON.stringify(result));
  return result;
};
