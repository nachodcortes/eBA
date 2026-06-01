import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Heart,
} from "lucide-react-native";
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

const categorias = [
  "festival",
  "recital",
  "fiesta",
  "teatro",
  "cultura",
  "gastronomia",
  "networking",
];

const busquedasPopulares = [
  "Lollapalooza",
  "Primavera",
  "Lali",
  "Airbag",
  "BRESH",
  "Techno",
];

export default function ExploreScreen() {
  const params = useLocalSearchParams();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [buscoAlgo, setBuscoAlgo] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    const iniciarPantalla = async () => {
      try {
        setLoading(true);

        const usuarioGuardado = await AsyncStorage.getItem("usuario");

        if (!usuarioGuardado) {
          router.replace("/login" as any);
          return;
        }

        const favoritosGuardados = await AsyncStorage.getItem("favoritos");
        setFavoritos(favoritosGuardados ? JSON.parse(favoritosGuardados) : []);

        if (params.filtro === "promocionados") {
          setBuscoAlgo(true);
          setCategoriaActiva("");
          setTextoBusqueda("");
          await obtenerEventosPromocionados();
          return;
        }

        if (params.categoria) {
          await filtrarPorCategoria(String(params.categoria));
          return;
        }

        await obtenerEventosRecomendados();
      } catch (error) {
        console.log("Error al iniciar búsqueda:", error);
      } finally {
        setLoading(false);
      }
    };

    iniciarPantalla();
  }, [params.filtro, params.categoria]);

  const obtenerEventosRecomendados = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eventos`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Error al traer eventos.");
        return;
      }

      setEventos(data.eventos || []);
      setBuscoAlgo(false);
      setCategoriaActiva("");
    } catch (error) {
      console.log("Error al traer eventos:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const obtenerEventosPromocionados = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eventos/promocionados`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Error al traer eventos promocionados.");
        return;
      }

      setEventos(data.eventos || []);
    } catch (error) {
      console.log("Error al traer promocionados:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const buscarEventos = async (texto: string) => {
    setTextoBusqueda(texto);
    setCategoriaActiva("");

    if (texto.trim().length === 0) {
      setBuscoAlgo(false);
      await obtenerEventosRecomendados();
      return;
    }

    try {
      setBuscoAlgo(true);

      const response = await fetch(
        `${API_URL}/api/eventos/buscar/${encodeURIComponent(texto.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Error al buscar eventos.");
        return;
      }

      setEventos(data.eventos || []);
    } catch (error) {
      console.log("Error al buscar eventos:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const filtrarPorCategoria = async (categoria: string) => {
    try {
      setLoading(true);
      setBuscoAlgo(true);
      setCategoriaActiva(categoria);
      setTextoBusqueda("");

      const response = await fetch(
        `${API_URL}/api/eventos/categoria/${categoria}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Error al filtrar eventos.");
        return;
      }

      setEventos(data.eventos || []);
    } catch (error) {
      console.log("Error al filtrar categoría:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = async () => {
    setTextoBusqueda("");
    setCategoriaActiva("");
    setBuscoAlgo(false);
    await obtenerEventosRecomendados();
  };

  const toggleFavorito = async (eventoId: string) => {
    let nuevosFavoritos: string[];

    if (favoritos.includes(eventoId)) {
      nuevosFavoritos = favoritos.filter((id) => id !== eventoId);
    } else {
      nuevosFavoritos = [...favoritos, eventoId];
    }

    setFavoritos(nuevosFavoritos);
    await AsyncStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
  };

  const esFavorito = (eventoId: string) => {
    return favoritos.includes(eventoId);
  };

  const irADetalle = (eventoId: string) => {
    router.push(`/event-detail/${eventoId}` as any);
  };

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
      month: "short",
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

  const obtenerTituloSeccion = () => {
    if (params.filtro === "promocionados") return "Eventos destacados";
    if (categoriaActiva) return `Eventos de ${categoriaActiva}`;
    if (buscoAlgo) return "Resultados";
    return "Eventos recomendados";
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#7528F0" />
        <Text style={styles.loadingText}>Cargando búsqueda...</Text>
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

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#A7A7B0" />

            <TextInput
              placeholder="Buscar eventos, personas..."
              placeholderTextColor="#A7A7B0"
              style={styles.input}
              value={textoBusqueda}
              onChangeText={buscarEventos}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={limpiarFiltros}
          >
            <SlidersHorizontal size={24} color="#7528F0" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {categorias.map((categoria) => {
            const activa = categoriaActiva === categoria;

            return (
              <TouchableOpacity
                key={categoria}
                style={[styles.category, activa && styles.categoryActive]}
                activeOpacity={0.85}
                onPress={() => filtrarPorCategoria(categoria)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activa && styles.categoryTextActive,
                  ]}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!buscoAlgo && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Search size={64} color="#8B35E8" />
            </View>

            <Text style={styles.emptyTitle}>Todavía no buscaste nada</Text>

            <Text style={styles.emptyText}>
              Explorá eventos, personas o lugares para encontrar con quién ir.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Búsquedas populares</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.popularContainer}>
          {busquedasPopulares.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.popularChip}
              activeOpacity={0.85}
              onPress={() => buscarEventos(item)}
            >
              <Search size={14} color="#8B35E8" />
              <Text style={styles.popularText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{obtenerTituloSeccion()}</Text>

          <TouchableOpacity onPress={limpiarFiltros}>
            <Text style={styles.seeAll}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {eventos.length === 0 ? (
          <View style={styles.noResultsCard}>
            <Text style={styles.noResultsTitle}>No encontramos eventos</Text>
            <Text style={styles.noResultsText}>
              Probá buscar otra palabra o elegir otra categoría.
            </Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {eventos.map((evento) => (
              <TouchableOpacity
                key={evento._id}
                style={styles.eventCard}
                activeOpacity={0.85}
                onPress={() => irADetalle(evento._id)}
              >
                <Image
                  source={{ uri: obtenerImagen(evento.imagen) }}
                  style={styles.eventImage}
                />

                <View style={styles.eventInfo}>
                  <View style={styles.eventTitleRow}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {evento.nombre}
                    </Text>

                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {evento.categoria || "evento"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventDate}>
                    {formatearFecha(evento.fecha)}
                  </Text>

                  <View style={styles.locationRow}>
                    <MapPin size={13} color="#8B35E8" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {obtenerUbicacion(evento.ubicacion)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.heartButton}
                  activeOpacity={0.85}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorito(evento._id);
                  }}
                >
                  <Heart
                    size={22}
                    color={esFavorito(evento._id) ? "#EF4444" : "#9B98A8"}
                    fill={esFavorito(evento._id) ? "#EF4444" : "transparent"}
                  />
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
    paddingTop: 62,
    paddingBottom: 130,
  },
  logo: {
    width: 80,
    height: 52,
    alignSelf: "center",
    marginBottom: 28,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#E2E8FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginRight: 14,
  },
  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: "#332047",
    outlineStyle: "none" as any,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8C8FF",
    boxShadow: "0px 5px 12px rgba(117,40,240,0.18)" as any,
  },
  categories: {
    marginBottom: 34,
  },
  category: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0D9F4",
    marginRight: 12,
    boxShadow: "0px 4px 8px rgba(0,0,0,0.08)" as any,
  },
  categoryActive: {
    backgroundColor: "#7528F0",
    borderColor: "#7528F0",
  },
  categoryText: {
    color: "#7528F0",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 34,
    marginBottom: 18,
  },
  emptyIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2D2934",
    marginBottom: 6,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#8D8A99",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 270,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D2934",
    textTransform: "capitalize",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7528F0",
  },
  popularContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  popularChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0D9F4",
    marginRight: 8,
    marginBottom: 10,
  },
  popularText: {
    marginLeft: 6,
    color: "#8B35E8",
    fontSize: 13,
    fontWeight: "700",
  },
  eventsList: {
    marginBottom: 24,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    boxShadow: "0px 6px 14px rgba(0,0,0,0.08)" as any,
  },
  eventImage: {
    width: 116,
    height: 72,
    borderRadius: 14,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: "#2D2934",
    marginRight: 6,
  },
  tag: {
    backgroundColor: "#F1ECFF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    color: "#7528F0",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  eventDate: {
    fontSize: 12,
    color: "#8D8A99",
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#8D8A99",
    flex: 1,
  },
  heartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F8F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  noResultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  noResultsTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 6,
  },
  noResultsText: {
    fontSize: 14,
    color: "#8D8A99",
    lineHeight: 20,
  },
});