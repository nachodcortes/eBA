import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Plus, UserRound } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../../config/api";

type Ubicacion = {
  ciudad?: string;
  barrio?: string;
  direccion?: string;
};

type Evento = {
  _id: string;
  nombre: string;
  descripcion?: string;
  fecha?: string;
  ubicacion?: Ubicacion;
  categoria?: string;
  imagen?: string;
  organizador?: string;
  esPromocionado?: boolean;
};

type UsuarioAsistencia = {
  _id?: string;
  id?: string;
  nombre?: string;
  email?: string;
  edad?: number;
  intereses?: string[];
  fotoPerfil?: string;
};

type Asistencia = {
  _id: string;
  usuarioId: UsuarioAsistencia;
  eventoId: string;
  estado: string;
};

export default function EventPeopleScreen() {
  const { id } = useLocalSearchParams();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState<
    "personas" | "publicaciones" | "info"
  >("personas");

  useEffect(() => {
    const iniciarPantalla = async () => {
      try {
        const usuarioGuardado = await AsyncStorage.getItem("usuario");

        if (!usuarioGuardado) {
          router.replace("/login" as any);
          return;
        }

        if (!id) {
          alert("No se encontró el evento.");
          return;
        }

        const responseEvento = await fetch(`${API_URL}/api/eventos/${id}`);
        const dataEvento = await responseEvento.json();

        if (!responseEvento.ok) {
          alert(dataEvento.message || dataEvento.error || "Error al traer evento.");
          return;
        }

        setEvento(dataEvento.evento || dataEvento);

        const responseAsistencias = await fetch(
          `${API_URL}/api/asistencias/evento/${id}`
        );

        const dataAsistencias = await responseAsistencias.json();

        if (!responseAsistencias.ok) {
          alert(
            dataAsistencias.message ||
              dataAsistencias.error ||
              "Error al traer personas interesadas."
          );
          return;
        }

        setAsistencias(dataAsistencias.asistencias || []);
      } catch (error) {
        console.log("Error en pantalla de personas:", error);
        alert("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    iniciarPantalla();
  }, [id]);

  const obtenerImagen = (imagen?: string) => {
    if (!imagen || imagen.trim() === "") {
      return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000";
    }

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return `${API_URL}${imagen}`;
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "Fecha a confirmar";

    const fechaDate = new Date(fecha);

    if (isNaN(fechaDate.getTime())) {
      return fecha;
    }

    return fechaDate.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
    });
  };

  const obtenerUbicacion = (ubicacion?: Ubicacion) => {
    if (!ubicacion) return "Ubicación a confirmar";

    if (ubicacion.barrio) return ubicacion.barrio;
    if (ubicacion.ciudad) return ubicacion.ciudad;
    if (ubicacion.direccion) return ubicacion.direccion;

    return "Ubicación a confirmar";
  };

  const obtenerInicial = (nombre?: string) => {
    if (!nombre) return "U";
    return nombre.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B35E8" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se encontró el evento</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.backFallback}>
          <Text style={styles.backFallbackText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#332047" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={{ uri: obtenerImagen(evento.imagen) }}
            style={styles.eventImage}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.eventTitle}>{evento.nombre}</Text>
            <Text style={styles.eventDate}>{formatearFecha(evento.fecha)}</Text>
            <Text style={styles.eventLocation}>
              {obtenerUbicacion(evento.ubicacion)}
            </Text>

            <View style={styles.avatarRow}>
              {asistencias.slice(0, 3).map((asistencia, index) => (
                <View
                  key={asistencia._id}
                  style={[styles.smallAvatar, index > 0 && styles.avatarOverlap]}
                >
                  <Text style={styles.smallAvatarText}>
                    {obtenerInicial(asistencia.usuarioId?.nombre)}
                  </Text>
                </View>
              ))}

              <View style={styles.plusCircle}>
                <Plus size={13} color="#FFFFFF" />
              </View>

              <Text style={styles.moreText}>+{asistencias.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsCard}>
          <TouchableOpacity
            style={[styles.tab, tabActiva === "personas" && styles.tabActive]}
            onPress={() => setTabActiva("personas")}
          >
            <Text
              style={[
                styles.tabText,
                tabActiva === "personas" && styles.tabTextActive,
              ]}
            >
              Personas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tabActiva === "publicaciones" && styles.tabActive]}
            onPress={() => setTabActiva("publicaciones")}
          >
            <Text
              style={[
                styles.tabText,
                tabActiva === "publicaciones" && styles.tabTextActive,
              ]}
            >
              Publicaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tabActiva === "info" && styles.tabActive]}
            onPress={() => setTabActiva("info")}
          >
            <Text
              style={[styles.tabText, tabActiva === "info" && styles.tabTextActive]}
            >
              Info
            </Text>
          </TouchableOpacity>
        </View>

        {tabActiva === "personas" && (
          <View style={styles.peopleList}>
            {asistencias.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Todavía no hay interesados</Text>
                <Text style={styles.emptyText}>
                  Cuando alguien toque “Quiero ir”, va a aparecer en esta lista.
                </Text>
              </View>
            ) : (
              asistencias.map((asistencia) => {
                const usuario = asistencia.usuarioId;

                return (
                  <View key={asistencia._id} style={styles.personCard}>
                    {usuario?.fotoPerfil ? (
                      <Image
                        source={{ uri: usuario.fotoPerfil }}
                        style={styles.personAvatar}
                      />
                    ) : (
                      <View style={styles.personAvatarFallback}>
                        <Text style={styles.personAvatarText}>
                          {obtenerInicial(usuario?.nombre)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {usuario?.nombre || "Usuario"}
                      </Text>

                      <Text style={styles.personSubtitle}>
                        {usuario?.email || "Sin email disponible"}
                      </Text>

                    </View>

                    <TouchableOpacity style={styles.connectButton} activeOpacity={0.85}>
                      <UserRound size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {tabActiva === "publicaciones" && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no hay publicaciones</Text>
            <Text style={styles.emptyText}>
              En el próximo sprint se van a poder ver publicaciones y comentarios
              relacionados a este evento.
            </Text>
          </View>
        )}

        {tabActiva === "info" && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Información del evento</Text>

            <Text style={styles.infoLabel}>Descripción</Text>
            <Text style={styles.infoText}>
              {evento.descripcion || "Sin descripción cargada."}
            </Text>

            <Text style={styles.infoLabel}>Categoría</Text>
            <Text style={styles.infoText}>{evento.categoria || "Evento"}</Text>

            <Text style={styles.infoLabel}>Organizador</Text>
            <Text style={styles.infoText}>{evento.organizador || "eBA"}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  center: {
    flex: 1,
    backgroundColor: "#F7F5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6F6D7A",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#332047",
  },
  backFallback: {
    marginTop: 18,
    backgroundColor: "#7528F0",
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 16,
  },
  backFallbackText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  container: {
    paddingHorizontal: 26,
    paddingTop: 58,
    paddingBottom: 60,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    marginBottom: 28,
  },
  eventImage: {
    width: 98,
    height: 78,
    borderRadius: 12,
    marginRight: 18,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#2D2934",
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2D2934",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: "#6F6D7A",
    marginBottom: 10,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8B35E8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  smallAvatarText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  plusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8B35E8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  moreText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#2D2934",
    fontWeight: "700",
  },
  tabsCard: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#8B35E8",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2D2934",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  peopleList: {
    paddingBottom: 20,
  },
  personCard: {
    minHeight: 72,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  personAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
  },
  personAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#8B35E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  personAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2D2934",
    marginBottom: 3,
  },
  personSubtitle: {
    fontSize: 12,
    color: "#8D8A99",
    marginBottom: 3,
  },
  statusText: {
    fontSize: 11,
    color: "#7528F0",
    fontWeight: "700",
  },
  connectButton: {
    width: 54,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#B484F2",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8D8A99",
    lineHeight: 21,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#7528F0",
    marginTop: 10,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#6F6D7A",
    lineHeight: 21,
  },
});