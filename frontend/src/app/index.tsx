import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import Logo from "../components/Logo";
import AuthLayout from "../components/AuthLayout";
import { router } from "expo-router";
export default function WelcomeScreen() {
  return (
    <AuthLayout compact>
      <View style={styles.content}>
       <Logo size="large" centered={true} showText={true} />

        <Image
          source={require("../../assets/images/mascotaseba.png")}
          style={styles.characters}
          showText="contain"
        />

        <Text style={styles.title}>
          Conectá con personas{"\n"}y viví experiencias
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/login" as any)}
        >
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register-interests" as any)}>
          <Text style={styles.link}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    paddingHorizontal: 32,
    alignItems: "center",
    alignSelf: "center",
    maxWidth: 430,
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: 34,
  },
  characters: {
    width: 260,
    height: 180,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#332047",
    textAlign: "center",
    lineHeight: 31,
    marginBottom: 30,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "#7528F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  link: {
    fontSize: 15,
    color: "#3A2451",
    textDecorationLine: "underline",
  },
});
