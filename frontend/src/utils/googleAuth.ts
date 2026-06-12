import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Usamos el scheme oficial de tu app.json
    redirectUri: AuthSession.makeRedirectUri({
      scheme: "eba", 
    }),
    
    // El ID de cliente Web (sin el espacio al final)
    webClientId: "59399847433-op44kmd7at7f4pdt1uokf7gmuo67odif.apps.googleusercontent.com",
    
    // Si creaste el de iOS en el paso anterior, ponlo acá:
    iosClientId: "59399847433-4h2t4qqc99tnbqo2vtbvf9tveoju6cnp.apps.googleusercontent.com",
    
    // Si creas uno de Android más adelante, irá acá:
    // androidClientId: "TU_ID_DE_CLIENTE_ANDROID.apps.googleusercontent.com",
  });

  return { request, response, promptAsync };
};