import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  IdCard,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../../config/api";
import BottomNav from "../../components/BottomNav";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import UserAvatar from "../../components/UserAvatar";
import { SolicitudOrganizador } from "../../types/SolicitudOrganizador";
import { Usuario } from "../../types/Usuario";

type Tab = "pendiente" | "aprobado" | "rechazado";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "pendiente", label: "Pendientes", icon: Clock3 },
  { key: "aprobado", label: "Aprobadas", icon: CheckCircle2 },
  { key: "rechazado", label: "Rechazadas", icon: XCircle },
];

export default function ManagerOrganizadores() {
  const [solicitudes, setSolicitudes] = useState<SolicitudOrganizador[]>([]);
  const [tab, setTab] = useState<Tab>("pendiente");
  const [loading, setLoading] = useState(true);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

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
        router.replace("/home" as any);
        return;
      }

      setManagerId(usuario.id || usuario._id || null);
      await cargarSolicitudes(tab);
    } catch (error) {
      console.log("Error al iniciar organizadores manager:", error);
      setLoading(false);
    }
  };

  const cargarSolicitudes = async (estado: Tab) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/solicitudes-organizador/manager/todas?estado=${estado}`
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudieron cargar las solicitudes.");
        return;
      }

      setSolicitudes(data.solicitudes || []);
    } catch (error) {
      console.log("Error cargando solicitudes de organizador:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandida = (id: string) => {
    setExpandidaId((prev) => (prev === id ? null : id));
    setRechazandoId(null);
    setMotivo("");
  };

  const actualizarEstado = async (
    solicitudId: string,
    estado: "aprobado" | "rechazado",
    motivoRechazo?: string
  ) => {
    if (!managerId) return;

    try {
      setProcesandoId(solicitudId);

      const response = await fetch(
        `${API_URL}/api/solicitudes-organizador/${solicitudId}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado, motivoRechazo, managerId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo actualizar la solicitud.");
        return;
      }

      setSolicitudes((prev) => prev.filter((item) => item._id !== solicitudId));
      setExpandidaId(null);
      setRechazandoId(null);
      setMotivo("");
      alert(
        estado === "aprobado"
          ? "Solicitud aprobada. El usuario ya es organizador."
          : "Solicitud rechazada."
      );
    } catch (error) {
      console.log("Error actualizando solicitud de organizador:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setProcesandoId(null);
    }
  };

  const obtenerUsuario = (item: SolicitudOrganizador): Usuario | null => {
    if (!item.usuarioId || typeof item.usuarioId === "string") return null;
    return item.usuarioId;
  };

  if (loading) {
    return <LoadingScreen text="Cargando solicitudes..." />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#332047" />
        </Pressable>

        <View style={styles.headerRow}>
          <IdCard size={22} color="#7528F0" />
          <Text style={styles.title}>Solicitudes de organizador</Text>
        </View>

        <Text style={styles.subtitle}>
          Revisá el documento de cada usuario y aprobá o rechazá su pedido
          para crear eventos.
        </Text>

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

        {solicitudes.length === 0 ? (
          <EmptyState
            icon={<IdCard size={54} color="#C7B8E8" />}
            title="No hay solicitudes acá"
            text={
              tab === "pendiente"
                ? "No hay solicitudes esperando revisión por ahora."
                : "Todavía no hay solicitudes en este estado."
            }
          />
        ) : (
          <View style={styles.list}>
            {solicitudes.map((solicitud) => {
              const usuario = obtenerUsuario(solicitud);
              const expandida = expandidaId === solicitud._id;
              const procesando = procesandoId === solicitud._id;

              return (
                <View key={solicitud._id} style={styles.card}>
                  <Pressable
                    style={styles.cardHeader}
                    onPress={() => toggleExpandida(solicitud._id)}
                  >
                    <UserAvatar usuario={usuario || undefined} size={44} />

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardNombre}>
                        {usuario?.nombre || "Usuario"}
                      </Text>
                      <Text style={styles.cardUsername}>
                        @{usuario?.nombreUsuario || "usuario"}
                      </Text>
                    </View>
                  </Pressable>

                  {expandida && (
                    <View style={styles.cardBody}>
                      <Image
                        source={{ uri: solicitud.fotoDocumento }}
                        style={styles.documentoImagen}
                        resizeMode="contain"
                      />

                      {solicitud.estado === "rechazado" &&
                        solicitud.motivoRechazo && (
                          <View style={styles.motivoBox}>
                            <Text style={styles.motivoTitle}>
                              Motivo del rechazo
                            </Text>
                            <Text style={styles.motivoText}>
                              {solicitud.motivoRechazo}
                            </Text>
                          </View>
                        )}

                      {tab !== "pendiente" && (
                        <Text style={styles.modificarAviso}>
                          {tab === "aprobado"
                            ? "Esta solicitud ya fue aprobada. Podés revocarla y rechazarla si hace falta."
                            : "Esta solicitud ya fue rechazada. Podés aprobarla si te arrepentiste."}
                        </Text>
                      )}

                      {rechazandoId === solicitud._id && (
                        <TextInput
                          style={styles.input}
                          value={motivo}
                          onChangeText={setMotivo}
                          placeholder="Contale al usuario por qué se rechaza"
                          multiline
                        />
                      )}

                      <View style={styles.actionsRow}>
                        {solicitud.estado !== "aprobado" && (
                          <Pressable
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() =>
                              actualizarEstado(solicitud._id, "aprobado")
                            }
                            disabled={procesando}
                          >
                            {procesando ? (
                              <ActivityIndicator color="#FFFFFF" />
                            ) : (
                              <>
                                <CheckCircle2 size={18} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>
                                  Aprobar
                                </Text>
                              </>
                            )}
                          </Pressable>
                        )}

                        {solicitud.estado !== "rechazado" && (
                          <Pressable
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => {
                              if (rechazandoId !== solicitud._id) {
                                setRechazandoId(solicitud._id);
                                return;
                              }

                              if (!motivo.trim()) {
                                alert("Contale al usuario el motivo del rechazo.");
                                return;
                              }

                              actualizarEstado(
                                solicitud._id,
                                "rechazado",
                                motivo.trim()
                              );
                            }}
                            disabled={procesando}
                          >
                            {procesando ? (
                              <ActivityIndicator color="#FFFFFF" />
                            ) : (
                              <>
                                <XCircle size={18} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>
                                  {rechazandoId === solicitud._id
                                    ? "Confirmar rechazo"
                                    : solicitud.estado === "aprobado"
                                    ? "Revocar y rechazar"
                                    : "Rechazar"}
                                </Text>
                              </>
                            )}
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
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
  container: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 130,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8E2F8",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
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
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E2F8",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardNombre: {
    fontSize: 15,
    fontWeight: "900",
    color: "#332047",
  },
  cardUsername: {
    fontSize: 12,
    color: "#8B35E8",
    fontWeight: "700",
    marginTop: 2,
  },
  cardBody: {
    padding: 14,
    paddingTop: 0,
  },
  documentoImagen: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#F1ECFF",
    marginBottom: 14,
  },
  motivoBox: {
    backgroundColor: "#FFF1F2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  motivoTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#E53935",
    marginBottom: 4,
  },
  motivoText: {
    fontSize: 13,
    color: "#7A2E2E",
    lineHeight: 19,
  },
  modificarAviso: {
    fontSize: 12,
    color: "#8D8A99",
    lineHeight: 18,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F7F5FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2D2934",
    borderWidth: 1,
    borderColor: "#E8E2F8",
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 16,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 13,
  },
  approveButton: {
    backgroundColor: "#12A150",
  },
  rejectButton: {
    backgroundColor: "#E53935",
  },
});