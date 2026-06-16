import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Clock,
  Check,
  X,
  Users,
  MessageCircle,
} from "lucide-react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../config/api";
import BottomNav from "../components/BottomNav";
import Logo from "../components/Logo";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import UserAvatar from "../components/UserAvatar";
import SectionHeader from "../components/SectionHeader";

import { Usuario } from "../types/Usuario";

type Conexion = {
  _id: string;
  usuario1: Usuario;
  usuario2: Usuario;
};

type Solicitud = {
  _id: string;
  usuariosolicitante: Usuario;
  usuarioreceptor: Usuario;
  estado: string;
};

export default function ConnectionsScreen() {
  const [usuarioActualId, setUsuarioActualId] = useState<string | null>(null);
  const [conexiones, setConexiones] = useState<Conexion[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    cargarDatos();
  }, [])
);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const idUsuario = usuario.id || usuario._id;

      if (!idUsuario) {
        alert("No se encontró el usuario logueado.");
        router.replace("/login" as any);
        return;
      }

      setUsuarioActualId(idUsuario);

      const responseConexiones = await fetch(
        `${API_URL}/api/conexiones/usuario/${idUsuario}`
      );

      const dataConexiones = await responseConexiones.json();

      if (!responseConexiones.ok) {
        setConexiones([]);
      } else {
        setConexiones(Array.isArray(dataConexiones) ? dataConexiones : []);
      }

      const responseSolicitudes = await fetch(
        `${API_URL}/api/solicitudes-conexion/usuario/${idUsuario}`
      );

      const dataSolicitudes = await responseSolicitudes.json();

      if (!responseSolicitudes.ok) {
        setSolicitudes([]);
      } else {
        setSolicitudes(dataSolicitudes.solicitudes || []);
      }
    } catch (error) {
      console.log("Error al cargar conexiones:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const aceptarSolicitud = async (solicitudId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-conexion/${solicitudId}/aceptar`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.mensaje || "No se pudo aceptar la solicitud.");
        return;
      }

      await cargarDatos();
    } catch (error) {
      console.log("Error al aceptar solicitud:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const rechazarSolicitud = async (solicitudId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-conexion/${solicitudId}/rechazar`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.mensaje || "No se pudo rechazar la solicitud.");
        return;
      }

      await cargarDatos();
    } catch (error) {
      console.log("Error al rechazar solicitud:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const obtenerIdUsuario = (usuario?: Usuario) => {
    return usuario?._id || usuario?.id;
  };

  const obtenerOtroUsuario = (conexion: Conexion) => {
    const usuario1Id = obtenerIdUsuario(conexion.usuario1);

    if (usuario1Id === usuarioActualId) {
      return conexion.usuario2;
    }

    return conexion.usuario1;
  };

  const obtenerUbicacion = (usuario?: Usuario) => {
    return usuario?.ubicacionAproximada?.ciudad || "Ubicación no cargada";
  };

  const obtenerIntereses = (usuario?: Usuario) => {
    if (usuario?.intereses && usuario.intereses.length > 0) {
      return usuario.intereses.slice(0, 2);
    }

    return ["eventos"];
  };

  if (loading) {
    return <LoadingScreen text="Cargando conexiones..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Logo size="medium" />

        <Text style={styles.title}>Conexiones</Text>

        <Text style={styles.subtitle}>
          Personas con las que conectaste para compartir eventos.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{conexiones.length}</Text>
            <Text style={styles.summaryLabel}>Conectadas</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{solicitudes.length}</Text>
            <Text style={styles.summaryLabel}>Solicitudes</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {conexiones.length + solicitudes.length}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>

        <SectionHeader title="Solicitudes recibidas" />

        {solicitudes.length === 0 ? (
          <View style={styles.emptyMiniCard}>
            <Clock size={22} color="#8B35E8" />
            <Text style={styles.emptyMiniText}>
              No tenés solicitudes pendientes.
            </Text>
          </View>
        ) : (
          solicitudes.map((solicitud) => {
            const usuarioSolicitante = solicitud.usuariosolicitante;

            return (
              <View key={solicitud._id} style={styles.requestCard}>
                <UserAvatar usuario={usuarioSolicitante} size={54} />

                <View style={styles.userInfo}>
                  <Text style={styles.name}>
                    {usuarioSolicitante?.nombre || "Usuario"}
                  </Text>

                  <Text style={styles.detail}>
                    {obtenerUbicacion(usuarioSolicitante)}
                  </Text>

                  <Text style={styles.eventText}>Quiere conectar con vos</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    activeOpacity={0.85}
                    onPress={() => aceptarSolicitud(solicitud._id)}
                  >
                    <Check size={19} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    activeOpacity={0.85}
                    onPress={() => rechazarSolicitud(solicitud._id)}
                  >
                    <X size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <SectionHeader title="Mis conexiones" />

        {conexiones.length === 0 ? (
          <EmptyState
            icon={<Users size={48} color="#B484F2" />}
            title="Todavía no tenés conexiones"
            text="Cuando aceptes solicitudes o conectes con personas interesadas en eventos, van a aparecer acá."
            buttonText="Explorar eventos"
            onPress={() => router.push("/explore" as any)}
          />
        ) : (
          conexiones.map((conexion) => {
            const usuarioConexion = obtenerOtroUsuario(conexion);
            const intereses = obtenerIntereses(usuarioConexion);

            return (
              <View key={conexion._id} style={styles.connectionCard}>
                <UserAvatar usuario={usuarioConexion} size={54} />

                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>
                      {usuarioConexion?.nombre || "Usuario"}
                    </Text>

                    <View style={styles.statusAccepted}>
                      <Text style={styles.statusAcceptedText}>Activa</Text>
                    </View>
                  </View>

                  <Text style={styles.detail}>
                    {obtenerUbicacion(usuarioConexion)}
                  </Text>

                  <Text style={styles.eventText}>
                    Ya pueden coordinar para ir a eventos
                  </Text>

                  <View style={styles.chipsRow}>
                    {intereses.map((interes) => (
                      <View key={interes} style={styles.chip}>
                        <Text style={styles.chipText}>{interes}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.messageButton} activeOpacity={0.85}>
                  <MessageCircle size={20} color="#7528F0" />
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#F4F6FB",
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
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#7528F0",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8D8A99",
    fontWeight: "700",
  },
  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#EEEAF7",
  },
  emptyMiniCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  emptyMiniText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#8D8A99",
    fontWeight: "700",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  connectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2D2934",
    flex: 1,
  },
  detail: {
    fontSize: 12,
    color: "#8D8A99",
    marginBottom: 4,
  },
  eventText: {
    fontSize: 12,
    color: "#5F5C68",
    fontWeight: "600",
    marginBottom: 7,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  acceptButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#8B35E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rejectButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },
  statusAccepted: {
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusAcceptedText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#12A150",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#F1ECFF",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7528F0",
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});