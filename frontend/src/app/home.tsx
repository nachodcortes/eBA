import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Search, MapPin } from "lucide-react-native";
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

const categoriasHome = [
  { label: "Festival", value: "festival" },
  { label: "Recital", value: "recital" },
  { label: "Fiesta", value: "fiesta" },
  { label: "Teatro", value: "teatro" },
  { label: "Cultura", value: "cultura" },
  { label: "Gastronomía", value: "gastronomia" },
];

export default function HomeScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iniciarHome = async () => {
      try {
        const usuarioGuardado = await AsyncStorage.getItem("usuario");

        if (!usuarioGuardado) {
          router.replace("/login" as any);
          return;
        }

        const response = await fetch(`${API_URL}/api/eventos`);
        const data = await response.json();

        if (!response.ok) {
          alert(data.message || data.error || "Error al traer eventos.");
          return;
        }

        setEventos(data.eventos || []);
      } catch (error) {
        console.log("Error al iniciar home:", error);
        alert("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    iniciarHome();
  }, []);

  const irADetalle = (eventoId: string) => {
    router.push(`/event-detail/${eventoId}` as any);
  };

  const irAExplore = () => {
    router.push("/explore" as any);
  };

  const irAExplorePromocionados = () => {
    router.push("/explore?filtro=promocionados" as any);
  };

  const irAExploreTodos = () => {
    router.push("/explore?filtro=todos" as any);
  };

  const irAExploreCategoria = (categoria: string) => {
    router.push(`/explore?categoria=${categoria}` as any);
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

  const obtenerImagen = (imagen?: string) => {
    if (!imagen || imagen.trim() === "") {
      return "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800";
    }

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return `${API_URL}${imagen}`;
  };

  const eventosDestacados = eventos.filter((evento) => evento.esPromocionado);
  const eventosRecomendados = eventos.filter((evento) => !evento.esPromocionado);

  const destacadosParaMostrar =
    eventosDestacados.length > 0
      ? eventosDestacados.slice(0, 2)
      : eventos.slice(0, 2);

  const recomendadosParaMostrar =
    eventosRecomendados.length > 0
      ? eventosRecomendados.slice(0, 4)
      : eventos.slice(2, 6);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#7528F0" />
        <Text style={styles.loadingText}>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
       <Logo size="large" centered={false} showText={true} />

        <Text style={styles.title}>¿Qué te pinta hoy?</Text>

        <Pressable style={styles.searchBox} onPress={irAExplore}>
          <Search size={18} color="#A7A7B0" />
          <Text style={styles.fakeInput}>Buscar eventos, personas...</Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {categoriasHome.map((item, index) => (
            <Pressable
              key={item.value}
              style={[styles.category, index === 0 && styles.categoryActive]}
              onPress={() => irAExploreCategoria(item.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  index === 0 && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destacados</Text>
        </View>

        <Pressable style={styles.fullSeeAllButton} onPress={irAExplorePromocionados}>
          <Text style={styles.fullSeeAllText}>Ver todos los destacados</Text>
        </Pressable>

        {eventos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay eventos cargados</Text>
            <Text style={styles.emptyText}>
              Cuando se carguen eventos en la base de datos, van a aparecer acá.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.featuredGrid}>
              {destacadosParaMostrar.map((evento) => (
                <Pressable
                  key={evento._id}
                  style={styles.featuredCard}
                  onPress={() => irADetalle(evento._id)}
                >
                  <Image
                    source={{ uri: obtenerImagen(evento.imagen) }}
                    style={styles.featuredImage}
                  />

                  <View pointerEvents="none" style={styles.overlay} />

                  <View pointerEvents="none" style={styles.cardText}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {evento.nombre}
                    </Text>

                    <Text style={styles.eventInfo}>
                      ↗ {evento.categoria || "Evento"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recomendados</Text>
            </View>

            <Pressable style={styles.fullSeeAllButton} onPress={irAExploreTodos}>
              <Text style={styles.fullSeeAllText}>
                Ver todos los recomendados
              </Text>
            </Pressable>

            <View style={styles.recommendedList}>
              {recomendadosParaMostrar.map((evento) => (
                <Pressable
                  key={evento._id}
                  style={styles.recommendedCard}
                  onPress={() => irADetalle(evento._id)}
                >
                  <Image
                    source={{ uri: obtenerImagen(evento.imagen) }}
                    style={styles.recommendedImage}
                  />

                  <View pointerEvents="none" style={styles.recommendedContent}>
                    <Text style={styles.recommendedTitle} numberOfLines={1}>
                      {evento.nombre}
                    </Text>

                    <View style={styles.locationRow}>
                      <MapPin size={13} color="#8B35E8" />

                      <Text style={styles.recommendedDate} numberOfLines={1}>
                        {formatearFecha(evento.fecha)} ·{" "}
                        {obtenerUbicacion(evento.ubicacion)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
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
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6F6D7A",
    fontWeight: "600",
  },
  container: {
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 140,
  },
  logoRow: {
  flexDirection: "row",
  marginBottom: 22,
  alignItems: "center",
  alignSelf: "flex-start",
},

logo: {
  width: 48,
  height: 48,
  marginRight: 10,
},

logoText: {
  fontSize: 30,
  fontWeight: "800",
  color: "#332047",
  letterSpacing: 0.5,
},
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#332047",
    marginBottom: 22,
  },
  searchBox: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D6E8FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 26,
  },
  fakeInput: {
    marginLeft: 10,
    fontSize: 15,
    color: "#A7A7B0",
  },
  categories: {
    marginBottom: 34,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  category: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: "#FFFFFF",
  },
  categoryActive: {
    backgroundColor: "#E7F3FF",
  },
  categoryText: {
    color: "#A0A0AA",
    fontSize: 15,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#177EEA",
    fontWeight: "800",
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#25252C",
  },
  fullSeeAllButton: {
    backgroundColor: "#F1ECFF",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  fullSeeAllText: {
    color: "#7528F0",
    fontSize: 14,
    fontWeight: "800",
  },
  featuredGrid: {
    flexDirection: "row",
    marginBottom: 34,
  },
  featuredCard: {
    flex: 1,
    height: 170,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginRight: 14,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  cardText: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  eventInfo: {
    color: "#E9E9F2",
    fontSize: 12,
    marginTop: 3,
    textTransform: "capitalize",
  },
  recommendedList: {
    marginBottom: 20,
  },
  recommendedCard: {
    minHeight: 88,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 16,
  },
  recommendedImage: {
    width: 116,
    height: 68,
    borderRadius: 15,
    marginRight: 16,
  },
  recommendedContent: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#282832",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recommendedDate: {
    fontSize: 13,
    color: "#8B8A99",
    marginLeft: 4,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#332047",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8D8A99",
    lineHeight: 21,
  },
});