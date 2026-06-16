
import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../config/api";
import BottomNav from "../components/BottomNav";
import Logo from "../components/Logo";
import LoadingScreen from "../components/LoadingScreen";
import SectionHeader from "../components/SectionHeader";
import EventListCard from "../components/EventListCard";
import EmptyState from "../components/EmptyState";
import InterestChips from "@/components/InterestChips";

import { Evento } from "../types/Evento";
import { getCached, setCached } from "../utils/cache";

type Interes = {
  _id: string;
  nombre: string;
  slug: string;
  icono?: string;
};

export default function HomeScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosRecomendados, setEventosRecomendados] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<Interes[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    iniciarHome();
  }, [])
);

  const iniciarHome = async (silencioso = false) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const usuarioId = usuario.id || usuario._id;
      const eventosCacheados = getCached<Evento[]>("eventos:todos");
      const categoriasCacheadas = getCached<Interes[]>("intereses:todos");
      const recomendadosCacheados = usuarioId
        ? getCached<Evento[]>(`eventos:recomendados:${usuarioId}`)
        : null;

      if (!silencioso && eventosCacheados) {
        setEventos(eventosCacheados);
        setCategorias(categoriasCacheadas || []);
        setEventosRecomendados(recomendadosCacheados || []);
        setLoading(false);
      }

      const responseEventos = await fetch(`${API_URL}/api/eventos`);
      const dataEventos = await responseEventos.json();

      if (!responseEventos.ok) {
        if (!silencioso) {
          alert(dataEventos.message || dataEventos.error || "Error al traer eventos.");
        }
        return;
      }

      setEventos(dataEventos.eventos || []);
      setCached("eventos:todos", dataEventos.eventos || []);

      fetch(`${API_URL}/api/intereses`)
        .then((response) => response.json().then((data) => ({ response, data })))
        .then(({ response, data }) => {
          if (response.ok) {
            setCategorias(data.intereses || []);
            setCached("intereses:todos", data.intereses || []);
          } else {
            console.log("Error al traer categorías:", data);
          }
        })
        .catch((error) => console.log("Error al traer categorías:", error));

      if (usuarioId) {
        fetch(`${API_URL}/api/eventos/recomendados/${usuarioId}`)
          .then((response) => response.json().then((data) => ({ response, data })))
          .then(({ response, data }) => {
            if (response.ok) {
              setEventosRecomendados(data.eventos || []);
              setCached(`eventos:recomendados:${usuarioId}`, data.eventos || []);
            } else {
              console.log("Error al traer recomendados:", data);
            }
          })
          .catch((error) => console.log("Error al traer recomendados:", error));
      }
    } catch (error) {
      console.log("Error al iniciar home:", error);
      if (!silencioso) {
        alert("No se pudo conectar con el servidor.");
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  };

  const irADetalle = async (eventoId: string) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const usuarioId = usuario.id || usuario._id;

      if (!usuarioId) {
        router.push(`/event-detail/${eventoId}` as any);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/asistencias/usuario/${usuarioId}`
      );

      const data = await response.json();

      if (!response.ok) {
        router.push(`/event-detail/${eventoId}` as any);
        return;
      }

      const asistencias = data.asistencias || [];

      const yaEstaInteresado = asistencias.some((asistencia: any) => {
        const evento = asistencia.eventoId;

        if (!evento) return false;
        if (typeof evento === "string") return evento === eventoId;

        return evento._id === eventoId;
      });

      if (yaEstaInteresado) {
        router.push(`/event-people/${eventoId}` as any);
      } else {
        router.push(`/event-detail/${eventoId}` as any);
      }
    } catch (error) {
      console.log("Error verificando asistencia:", error);
      router.push(`/event-detail/${eventoId}` as any);
    }
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

  const irAExploreRecomendados = () => {
    router.push("/explore?filtro=recomendados" as any);
  };
  const eventosDestacados = eventos.filter((evento) => evento.esPromocionado);

  const destacadosParaMostrar =
    eventosDestacados.length > 0
      ? eventosDestacados.slice(0, 2)
      : eventos.slice(0, 2);

  const recomendadosParaMostrar =
    eventosRecomendados.length > 0
      ? eventosRecomendados.slice(0, 4)
      : eventos.filter((evento) => !evento.esPromocionado).slice(0, 4);

  if (loading) {
    return <LoadingScreen text="Cargando eventos..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Logo size="medium" />

        <Text style={styles.title}>¿Qué te pinta hoy?</Text>

        <Pressable style={styles.searchBox} onPress={irAExplore}>
          <Search size={18} color="#eaeaf9" />
          <Text style={styles.fakeInput}>Buscar eventos...</Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          <InterestChips
            intereses={categorias}
            onPress={irAExploreCategoria}
            variant="home"
          />
        </ScrollView>

        <SectionHeader
          title="Destacados"
          actionText="Ver todos"
          onPress={irAExplorePromocionados}
        />

        {eventos.length === 0 ? (
          <EmptyState
            title="No hay eventos cargados"
            text="Cuando se carguen eventos en la base de datos, van a aparecer acá."
          />
        ) : (
          <>
            <View style={styles.featuredGrid}>
              {destacadosParaMostrar.map((evento) => (
                <EventListCard
                  key={evento._id}
                  evento={evento}
                  onPress={() => irADetalle(evento._id)}
                />
              ))}
            </View>

            <SectionHeader
              title="Recomendados para vos"
              actionText="Ver todos"
              onPress={irAExploreRecomendados}
            />

            <View style={styles.recommendedList}>
              {recomendadosParaMostrar.map((evento) => (
                <EventListCard
                  key={evento._id}
                  evento={evento}
                  onPress={() => irADetalle(evento._id)}
                />
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
  container: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#332047",
    marginBottom: 18,
  },
  searchBox: {
    height: 50,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E0F4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 22,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  fakeInput: {
    marginLeft: 10,
    fontSize: 14,
    color: "#9A96A8",
    fontWeight: "500",
  },
categories: {
  marginBottom: 28,
},
categoriesContent: {
  paddingRight: 16,
  alignItems: "center",
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
  featuredGrid: {
    marginBottom: 28,
  },
  recommendedList: {
    marginBottom: 20,
  },
});
