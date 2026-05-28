import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomNav from "../components/BottomNav";
import { router } from "expo-router";
const cerrarSesion = () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  router.replace("/login" as any);
};
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Bienvenida, {JSON.parse(localStorage.getItem("usuario") || "{}").nombre || "Usuario"}!
        </Text>
        <TouchableOpacity onPress={cerrarSesion}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Acá mas pronto vas a poder ver y editar tu información personal, tus intereses y tus eventos guardados.
        </Text>
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#332047",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#8D8A99",
    lineHeight: 22,
  },
  logout: {
    fontSize: 16,
    color: "#3a1fa6",
    textDecorationLine: "underline",
  },
});