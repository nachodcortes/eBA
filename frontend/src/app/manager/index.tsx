import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ShieldCheck, Clock3, CheckCircle2, XCircle, IdCard } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../../config/api";
import BottomNav from "../../components/BottomNav";
import Logo from "../../components/Logo";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import EventListCard from "../../components/EventListCard";
import { Evento, EstadoEvento } from "../../types/Evento";

type Tab = "pendiente" | "aprobado" | "rechazado";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "pendiente", label: "Pendientes", icon: Clock3 },
  { key: "aprobado", label: "Aprobados", icon: CheckCircle2 },
  { key: "rechazado", label: "Rechazados", icon: XCircle },
];

export default function ManagerEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tab, setTab] = useState<Tab>("pendiente");
  const [loading, setLoading] = useState(true);
  const [permitido, setPermitido] = useState<boolean | null>(null);
  const [organizadoresPendientes, setOrganizadoresPendientes] = useState(0);

  useFocusEffect(
    useCallback(() => {
      iniciar();
    }, [tab])
  );

  const iniciar = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);

      if (!usuario.esManager) {
        setPermitido(false);
        setLoading(false);
        return;
      }

      setPermitido(true);
      await cargarEventos(tab);
      cargarOrganizadoresPendientes();
    } catch (error) {
      console.log("Error al iniciar panel manager:", error);
      setLoading(false);
    }
  };

  const cargarOrganizadoresPendientes = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-organizador/manager/todas?estado=pendiente`
      );
      const data = await response.json();

      if (response.ok) {
        setOrganizadoresPendientes((data.solicitudes || []).length);
      }
    } catch (error) {
      console.log("Error cargando solicitudes de organizador:", error);
    }
  };

  const cargarEventos = async (estado: Tab) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/eventos/manager/todos?estado=${estado}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.message || "Error al traer los eventos.");
        return;
      }

      setEventos(data.eventos || []);
    } catch (error) {
      console.log("Error al cargar eventos del manager:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (permitido === false) {
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <EmptyState
            icon={<ShieldCheck size={54} color="#C7B8E8" />}
            title="Acceso restringido"
            text="Esta sección es solo para managers de eBA."
            buttonText="Volver al inicio"
            onPress={() => router.replace("/home" as any)}
          />
        </View>
        <BottomNav />
      </View>
    );
  }

  if (loading || permitido === null) {
    return <LoadingScreen text="Cargando eventos..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Logo size="medium" />

        <View style={styles.headerRow}>
          <ShieldCheck size={22} color="#7528F0" />
          <Text style={styles.title}>Verificación de eventos</Text>
        </View>

        <Text style={styles.subtitle}>
          Revisá los eventos creados por organizadores y aprobalos o
          rechazalos antes de que se muestren en la app.
        </Text>

        <Pressable
          style={styles.organizadoresCard}
          onPress={() => router.push("/manager/organizadores" as any)}
        >
          <View style={styles.organizadoresIconBox}>
            <IdCard size={20} color="#7528F0" />
          </View>

          <View style={styles.organizadoresTextBox}>
            <Text style={styles.organizadoresTitle}>
              Solicitudes de organizador
            </Text>
            <Text style={styles.organizadoresSubtitle}>
              {organizadoresPendientes > 0
                ? `${organizadoresPendientes} pendiente${
                    organizadoresPendientes === 1 ? "" : "s"
                  } de revisión`
                : "No hay solicitudes pendientes"}
            </Text>
          </View>

          {organizadoresPendientes > 0 && (
            <View style={styles.organizadoresBadge}>
              <Text style={styles.organizadoresBadgeText}>
                {organizadoresPendientes}
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.tabs}>
          {TABS.map((item) => {
            const Icon = item.icon;
            const activa = tab === item.key;

            return (
              <Pressable
                key={item.key}
                style={[styles.tab, activa && styles.tabActive]}
                onPress={() => setTab(item.key)}
              >
                <Icon size={15} color={activa ? "#FFFFFF" : "#7528F0"} />
                <Text style={[styles.tabText, activa && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {eventos.length === 0 ? (
          <EmptyState
            icon={<Clock3 size={54} color="#C7B8E8" />}
            title="No hay eventos acá"
            text={
              tab === "pendiente"
                ? "No hay eventos esperando verificación por ahora."
                : "Todavía no hay eventos en este estado."
            }
          />
        ) : (
          <View style={styles.list}>
            {eventos.map((evento) => (
              <EventListCard
                key={evento._id}
                evento={evento}
                status={estadoLabel(evento.estado)}
                onPress={() => router.push(`/manager/${evento._id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const estadoLabel = (estado?: EstadoEvento) => {
  if (estado === "aprobado") return "Aprobado";
  if (estado === "rechazado") return "Rechazado";
  return "Pendiente de verificación";
};

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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#332047",
  },
  subtitle: {
    fontSize: 14,
    color: "#8D8A99",
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 22,
  },
  organizadoresCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E2F8",
  },
  organizadoresIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  organizadoresTextBox: {
    flex: 1,
  },
  organizadoresTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#332047",
  },
  organizadoresSubtitle: {
    fontSize: 12,
    color: "#8D8A99",
    fontWeight: "700",
    marginTop: 2,
  },
  organizadoresBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  organizadoresBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E2F8",
  },
  tabActive: {
    backgroundColor: "#7528F0",
    borderColor: "#7528F0",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7528F0",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  list: {
    gap: 0,
  },
});