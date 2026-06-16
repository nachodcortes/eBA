import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../../config/api";
import LoadingScreen from "../../components/LoadingScreen";
import ProfileAvatarLink from "../../components/ProfileAvatarLink";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import { Usuario } from "../../types/Usuario";

type Chat = {
  _id: string;
  participantes: Usuario[];
};

type Mensaje = {
  _id: string;
  chatId: string;
  usuarioEmisorId: Usuario | string;
  contenido: string;
  fechaEnvio?: string;
  createdAt?: string;
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();

  const [chat, setChat] = useState<Chat | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [usuarioActualId, setUsuarioActualId] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      iniciarChat();
    }, [id])
  );

  const iniciarChat = async () => {
    try {
      setLoading(true);

      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const idUsuario = usuario.id || usuario._id;

      if (!idUsuario || !id) {
        router.replace("/login" as any);
        return;
      }

      setUsuarioActualId(idUsuario);

      const [responseChat, responseMensajes] = await Promise.all([
        fetch(`${API_URL}/api/chats/${id}`),
        fetch(`${API_URL}/api/mensajes/chat/${id}`),
      ]);

      const dataChat = await responseChat.json();
      const dataMensajes = await responseMensajes.json();

      if (!responseChat.ok) {
        alert(dataChat.error || "No se pudo cargar el chat.");
        return;
      }

      setChat(dataChat.chat);

      if (responseMensajes.ok) {
        setMensajes(dataMensajes.mensajes || []);
      }
    } catch (error) {
      console.log("Error iniciando chat:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMensajes = async (chatId: string) => {
    const response = await fetch(`${API_URL}/api/mensajes/chat/${chatId}`);
    const data = await response.json();

    if (response.ok) {
      setMensajes(data.mensajes || []);
    }
  };

  useAutoRefresh(
    useCallback(() => {
      if (!id) return;
      return cargarMensajes(String(id));
    }, [id]),
    5000,
    !loading
  );

  const obtenerUsuarioId = (usuario?: Usuario | string | null) => {
    if (!usuario) return null;
    if (typeof usuario === "string") return usuario;
    return usuario.id || usuario._id || null;
  };

  const obtenerOtroUsuario = () => {
    return chat?.participantes.find((participante) => {
      const participanteId = participante._id || participante.id;
      return participanteId !== usuarioActualId;
    });
  };

  const enviarMensaje = async () => {
    try {
      if (!texto.trim() || !usuarioActualId || !id) return;

      setEnviando(true);

      const response = await fetch(`${API_URL}/api/mensajes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: String(id),
          usuarioEmisorId: usuarioActualId,
          contenido: texto.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo enviar el mensaje.");
        return;
      }

      setMensajes((prev) => [
        ...prev,
        {
          ...data.mensaje,
          usuarioEmisorId: usuarioActualId,
          fechaEnvio: data.mensaje.fechaEnvio || new Date().toISOString(),
        },
      ]);
      setTexto("");
    } catch (error) {
      console.log("Error enviando mensaje:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const formatearHora = (fecha?: string) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingScreen text="Cargando chat..." />;
  }

  const otroUsuario = obtenerOtroUsuario();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#332047" />
        </TouchableOpacity>

        <ProfileAvatarLink usuario={otroUsuario} size={42} />

        <View style={styles.headerText}>
          <Text style={styles.title}>{otroUsuario?.nombre || "Chat"}</Text>
          <Text style={styles.subtitle}>Conexión activa</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
      >
        {mensajes.map((mensaje) => {
          const emisorId = obtenerUsuarioId(mensaje.usuarioEmisorId);
          const esMio = emisorId === usuarioActualId;

          return (
            <View
              key={mensaje._id}
              style={[styles.messageRow, esMio && styles.messageRowMine]}
            >
              <View style={[styles.messageBubble, esMio && styles.messageMine]}>
                <Text style={[styles.messageText, esMio && styles.messageTextMine]}>
                  {mensaje.contenido}
                </Text>

                <Text style={[styles.messageTime, esMio && styles.messageTimeMine]}>
                  {formatearHora(mensaje.fechaEnvio || mensaje.createdAt)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Escribí un mensaje..."
          placeholderTextColor="#A7A7B0"
          value={texto}
          onChangeText={setTexto}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, (!texto.trim() || enviando) && styles.sendDisabled]}
          activeOpacity={0.85}
          disabled={!texto.trim() || enviando}
          onPress={enviarMensaje}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: "#332047",
  },
  subtitle: {
    fontSize: 12,
    color: "#12A150",
    fontWeight: "800",
    marginTop: 2,
  },
  messagesContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "78%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderTopLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  messageMine: {
    backgroundColor: "#7528F0",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 6,
  },
  messageText: {
    fontSize: 15,
    color: "#332047",
    lineHeight: 21,
  },
  messageTextMine: {
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 10,
    color: "#8D8A99",
    fontWeight: "700",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  messageTimeMine: {
    color: "rgba(255,255,255,0.75)",
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    maxHeight: 110,
    borderRadius: 22,
    backgroundColor: "#F7F5FF",
    borderWidth: 1,
    borderColor: "#E0D9F4",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#332047",
    textAlignVertical: "top",
    outlineStyle: "none" as any,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#7528F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  sendDisabled: {
    opacity: 0.45,
  },
});
