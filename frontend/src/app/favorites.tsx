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
import { router } from "expo-router";
import { Heart, MapPin, CalendarDays, Trash2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../components/Logo";
import { API_URL } from "../config/api";
import BottomNav from "../components/BottomNav";

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

export default function FavoritesScreen() {
  const [eventosFavoritos, setEventosFavoritos] = useState<Evento[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);

      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const favoritosGuardados = await AsyncStorage.getItem("favoritos");
      const ids: string[] = favoritosGuardados
        ? JSON.parse(favoritosGuardados)
        : [];

      setFavoritosIds(ids);

      const response = await fetch(`${API_URL}/api/eventos`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Error al traer eventos.");
        return;
      }

      const todosLosEventos: Evento[] = data.eventos || [];

      const eventosFiltrados = todosLosEventos.filter((evento) =>
        ids.includes(evento._id)
      );

      setEventosFavoritos(eventosFiltrados);
    } catch (error) {
      console.log("Error al cargar favoritos:", error);
      alert("No se pudieron cargar los favoritos.");
    } finally {
      setLoading(false);
    }
  };

  const quitarFavorito = async (eventoId: string) => {
    const nuevosFavoritos = favoritosIds.filter((id) => id !== eventoId);

    setFavoritosIds(nuevosFavoritos);
    setEventosFavoritos((prev) =>
      prev.filter((evento) => evento._id !== eventoId)
    );

    await AsyncStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
  };

  const irADetalle = (eventoId: string) => {
    router.push(`/event-detail/${eventoId}` as any);
  };

  const obtenerImagen = (imagen?: string) => {
    if (!imagen || imagen.trim() === "") {
      return "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000";
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
      month: "short",
      year: "numeric",
    });
  };

  const obtenerUbicacion = (ubicacion?: Ubicacion) => {
    if (!ubicacion) return "Ubicación a confirmar";

    if (ubicacion.barrio && ubicacion.ciudad) {
      return `${ubicacion.barrio}, ${ubicacion.ciudad}`;
    }

    if (ubicacion.ciudad) return ubicacion.ciudad;
    if (ubicacion.direccion) return ubicacion.direccion;

    return "Ubicación a confirmar";
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#7528F0" />
        <Text style={styles.loadingText}>Cargando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

           
        <Text style={styles.title}>Favoritos</Text>

        <Text style={styles.subtitle}>
          Eventos que guardaste para ver más tarde.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Heart size={24} color="#EF4444" fill="#EF4444" />
          </View>

          <View>
            <Text style={styles.summaryTitle}>
              {eventosFavoritos.length} eventos guardados
            </Text>
           
          </View>
        </View>

        {eventosFavoritos.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Heart size={54} color="#C7B8E8" />
            </View>

            <Text style={styles.emptyTitle}>Todavía no tenés favoritos</Text>

            <Text style={styles.emptyText}>
              Tocá el corazón en la pantalla de búsqueda para guardar eventos
              que te interesen.
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              activeOpacity={0.85}
              onPress={() => router.push("/explore" as any)}
            >
              <Text style={styles.exploreButtonText}>Buscar eventos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {eventosFavoritos.map((evento) => (
              <TouchableOpacity
                key={evento._id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => irADetalle(evento._id)}
              >
                <Image
                  source={{ uri: obtenerImagen(evento.imagen) }}
                  style={styles.eventImage}
                />

                <View style={styles.eventInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {evento.nombre}
                    </Text>

                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>
                        {evento.categoria || "evento"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <CalendarDays size={13} color="#7528F0" />
                    <Text style={styles.infoText}>
                      {formatearFecha(evento.fecha)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MapPin size={13} color="#7528F0" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {obtenerUbicacion(evento.ubicacion)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  activeOpacity={0.85}
                  onPress={(e) => {
                    e.stopPropagation();
                    quitarFavorito(evento._id);
                  }}
                >
                  <Trash2 size={19} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
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
  loadingScreen: {
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
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: "#8D8A99",
    maxWidth: 240,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#8D8A99",
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 22,
  },
  exploreButton: {
    backgroundColor: "#7528F0",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 18,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  list: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  eventImage: {
    width: 104,
    height: 76,
    borderRadius: 16,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: "#2D2934",
    marginRight: 6,
  },
  categoryTag: {
    backgroundColor: "#F1ECFF",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  categoryText: {
    color: "#7528F0",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#8D8A99",
    flex: 1,
  },
  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  logo: {
    width: 100,
    height: 60,
  },
});