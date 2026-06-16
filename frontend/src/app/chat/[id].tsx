import { useCallback, useEffect, useRef, useState } from "react";
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
import { ArrowLeft, Send, Shield } from "lucide-react-native";
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
  const scrollRef = useRef<ScrollView | null>(null);

  const scrollAlFinal = (animado = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: animado });
    });
  };

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
        scrollAlFinal(false);
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
      scrollAlFinal(true);
    }
  };

  useEffect(() => {
    scrollAlFinal(true);
  }, [mensajes.length]);

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
      scrollAlFinal(true);
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

        <View style={styles.headerAvatarBox}>
          <ProfileAvatarLink usuario={otroUsuario} size={44} />
          <View style={styles.headerOnlineDot} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{otroUsuario?.nombre || "Chat"}</Text>
          <Text style={styles.subtitle}>Conexión activa · respondé cuando quieras</Text>
        </View>

        <View style={styles.secureIcon}>
          <Shield size={18} color="#6D28E8" />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollAlFinal(true)}
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
        <View style={styles.inputShell}>
          <TextInput
            style={styles.input}
            placeholder="Escribí un mensaje..."
            placeholderTextColor="#A7A7B0"
            value={texto}
            onChangeText={setTexto}
            multiline
          />
        </View>

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
    backgroundColor: "#F4F6FB",
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 58,
    paddingBottom: 14,
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
  headerAvatarBox: {
    position: "relative",
    marginRight: 10,
  },
  headerOnlineDot: {
    position: "absolute",
    right: 12,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#12A150",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
  secureIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "82%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderTopLeftRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#ECE8F4",
  },
  messageMine: {
    backgroundColor: "#6D28E8",
    borderColor: "#6D28E8",
    borderTopLeftRadius: 20,
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
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#EEEAF7",
  },
  inputShell: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#F4F2FA",
    borderWidth: 1,
    borderColor: "#E0D9F4",
    paddingHorizontal: 2,
  },
  input: {
    maxHeight: 110,
    minHeight: 46,
    paddingHorizontal: 14,
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
    backgroundColor: "#6D28E8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  sendDisabled: {
    opacity: 0.45,
  },
});
