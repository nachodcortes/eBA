import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../config/api";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import Logo from "../components/Logo";
import ProfileAvatarLink from "../components/ProfileAvatarLink";
import useAutoRefresh from "../hooks/useAutoRefresh";
import { Usuario } from "../types/Usuario";

type Chat = {
  _id: string;
  participantes: Usuario[];
  updatedAt?: string;
};

export default function ChatsScreen() {
  const [usuarioActualId, setUsuarioActualId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarChats();
    }, [])
  );

  const cargarChats = async (silencioso = false) => {
    try {
      if (!silencioso) {
        setLoading(true);
      }

      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const idUsuario = usuario.id || usuario._id;

      if (!idUsuario) {
        router.replace("/login" as any);
        return;
      }

      setUsuarioActualId(idUsuario);

      const response = await fetch(`${API_URL}/api/chats/usuario/${idUsuario}`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudieron cargar tus chats.");
        return;
      }

      setChats(data.chats || []);
    } catch (error) {
      console.log("Error cargando chats:", error);
      if (!silencioso) {
        alert("No se pudo conectar con el servidor.");
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  };

  useAutoRefresh(
    useCallback(() => cargarChats(true), []),
    10000,
    !loading
  );

  const obtenerOtroUsuario = (chat: Chat) => {
    return chat.participantes.find((participante) => {
      const participanteId = participante._id || participante.id;
      return participanteId !== usuarioActualId;
    });
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return <LoadingScreen text="Cargando chats..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Logo size="medium" />

        <Text style={styles.title}>Chats</Text>

        <Text style={styles.subtitle}>
          Conversaciones con tus conexiones para coordinar antes del evento.
        </Text>

        {chats.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={52} color="#B484F2" />}
            title="Todavía no tenés chats"
            text="Conectá con alguien desde un evento y abrí una conversación."
            buttonText="Explorar eventos"
            onPress={() => router.push("/explore" as any)}
          />
        ) : (
          chats.map((chat) => {
            const usuario = obtenerOtroUsuario(chat);

            return (
              <TouchableOpacity
                key={chat._id}
                style={styles.chatCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/chat/${chat._id}` as any)}
              >
                <ProfileAvatarLink usuario={usuario} size={52} />

                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>
                    {usuario?.nombre || "Usuario"}
                  </Text>

                  <Text style={styles.chatPreview}>
                    Tocá para seguir coordinando
                  </Text>
                </View>

                <Text style={styles.chatDate}>{formatearFecha(chat.updatedAt)}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  container: {
    paddingHorizontal: 28,
    paddingTop: 74,
    paddingBottom: 130,
  },
  title: {
    fontSize: 31,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8D8A99",
    lineHeight: 22,
    marginBottom: 24,
  },
  chatCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2D2934",
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 13,
    color: "#8D8A99",
    fontWeight: "700",
  },
  chatDate: {
    fontSize: 12,
    color: "#8D8A99",
    fontWeight: "800",
  },
});
