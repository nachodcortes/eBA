import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Search,
  UserPlus,
  Clock3,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../../config/api";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import ProfileAvatarLink from "../../components/ProfileAvatarLink";
import SectionHeader from "../../components/SectionHeader";
import useAutoRefresh from "../../hooks/useAutoRefresh";

import CreatePublicationModal from "../../components/publications/CreatePublicationModal";
import PublicationPreviewCard from "../../components/publications/PublicationPreviewCard";

import { Evento } from "../../types/Evento";
import { Usuario } from "../../types/Usuario";
import { Publicacion, Comentario } from "../../types/Social";

import { obtenerImagen, formatearFechaLarga } from "../../utils/eventHelpers";
import { getCached, setCached } from "../../utils/cache";

type Asistencia = {
  _id: string;
  usuarioId: Usuario;
  eventoId: string;
  estado: string;
};

type Conexion = {
  _id: string;
  usuario1: Usuario;
  usuario2: Usuario;
};

type SolicitudConexion = {
  _id: string;
  usuariosolicitante: Usuario;
  usuarioreceptor: Usuario;
  estado: string;
};

export default function EventPeopleScreen() {
  const { id } = useLocalSearchParams();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [conexiones, setConexiones] = useState<Conexion[]>([]);
  const [conexionesIds, setConexionesIds] = useState<string[]>([]);
  const [solicitudesPendientesIds, setSolicitudesPendientesIds] = useState<
    string[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [usuarioActualId, setUsuarioActualId] = useState<string | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  const [tabActiva, setTabActiva] = useState<
    "personas" | "publicaciones" | "info"
  >("personas");

  const [busquedaPersonas, setBusquedaPersonas] = useState("");

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [comentariosPorPublicacion, setComentariosPorPublicacion] = useState<
    Record<string, Comentario[]>
  >({});
  const [nuevaPublicacion, setNuevaPublicacion] = useState("");
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(false);
  const [modalPublicacionVisible, setModalPublicacionVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      iniciarPantalla();
    }, [id])
  );

  const iniciarPantalla = async (silencioso = false) => {
    try {
      if (!silencioso) {
        setLoading(true);
      }

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
      setUsuarioActual(usuario);

      if (!id) {
        alert("No se encontró el evento.");
        return;
      }

      const [
        responseEvento,
        responseAsistencias,
        responseConexiones,
        responseSolicitudes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/eventos/${id}`),
        fetch(`${API_URL}/api/asistencias/evento/${id}`),
        fetch(`${API_URL}/api/conexiones/usuario/${idUsuario}`),
        fetch(`${API_URL}/api/solicitudes-conexion/pendientes/${idUsuario}`),
      ]);

      const dataEvento = await responseEvento.json();

      if (!responseEvento.ok) {
        if (!silencioso) {
          alert(dataEvento.message || dataEvento.error || "Error al traer evento.");
        }
        return;
      }

      setEvento(dataEvento.evento || dataEvento);

      const dataAsistencias = await responseAsistencias.json();

      if (!responseAsistencias.ok) {
        if (!silencioso) {
          alert(
            dataAsistencias.message ||
              dataAsistencias.error ||
              "Error al traer personas interesadas."
          );
        }
        return;
      }

      setAsistencias(dataAsistencias.asistencias || []);

      const dataConexiones = await responseConexiones.json();

      if (responseConexiones.ok) {
        const conexionesObtenidas = dataConexiones || [];
        setConexiones(conexionesObtenidas);

        const idsAmigos = conexionesObtenidas.map((conexion: Conexion) => {
          const usuario1Id = obtenerUsuarioId(conexion.usuario1);
          const usuario2Id = obtenerUsuarioId(conexion.usuario2);

          if (usuario1Id === idUsuario) {
            return usuario2Id;
          }

          return usuario1Id;
        });

        setConexionesIds(idsAmigos.filter(Boolean));
      }

      const dataSolicitudes = await responseSolicitudes.json();

      if (responseSolicitudes.ok) {
        const idsPendientes = (dataSolicitudes.solicitudes || []).map(
          (solicitud: SolicitudConexion) => {
            const solicitanteId = obtenerUsuarioId(solicitud.usuariosolicitante);
            const receptorId = obtenerUsuarioId(solicitud.usuarioreceptor);

            if (solicitanteId === idUsuario) {
              return receptorId;
            }

            return solicitanteId;
          }
        );

        setSolicitudesPendientesIds(idsPendientes.filter(Boolean));
      }

      cargarPublicaciones(String(id), silencioso);
    } catch (error) {
      console.log("Error en pantalla de personas:", error);
      if (!silencioso) {
        alert("No se pudo conectar con el servidor.");
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  };

  const cargarPublicaciones = async (eventoId: string, silencioso = false) => {
    try {
      const publicacionesCacheadas = getCached<Publicacion[]>(
        `publicaciones:evento:${eventoId}`
      );
      const comentariosCacheados = getCached<Record<string, Comentario[]>>(
        `comentarios:evento:${eventoId}`
      );

      if (!silencioso && publicacionesCacheadas) {
        setPublicaciones(publicacionesCacheadas);
        setComentariosPorPublicacion(comentariosCacheados || {});
        setLoadingPublicaciones(false);
      }

      if (!silencioso) {
        setLoadingPublicaciones(!publicacionesCacheadas);
      }

      const response = await fetch(
        `${API_URL}/api/publicaciones/evento/${eventoId}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Error al traer publicaciones:", data);
        return;
      }

      const publicacionesObtenidas = data.publicaciones || [];
      setPublicaciones(publicacionesObtenidas);
      setCached(`publicaciones:evento:${eventoId}`, publicacionesObtenidas);

      if (!silencioso) {
        setLoadingPublicaciones(false);
      }

      const comentariosEntries = await Promise.all(
        publicacionesObtenidas.map(async (publicacion: Publicacion) => {
          try {
            const responseComentarios = await fetch(
              `${API_URL}/api/comentarios/publicacion/${publicacion._id}`
            );

            const dataComentarios = await responseComentarios.json();

            return [
              publicacion._id,
              responseComentarios.ok ? dataComentarios.comentarios || [] : [],
            ] as const;
          } catch (error) {
            console.log("Error cargando comentarios de publicación:", error);
            return [publicacion._id, []] as const;
          }
        })
      );

      const comentariosTemp = Object.fromEntries(comentariosEntries);

      setComentariosPorPublicacion(comentariosTemp);
      setCached(`comentarios:evento:${eventoId}`, comentariosTemp);
    } catch (error) {
      console.log("Error cargando publicaciones:", error);
    } finally {
      if (!silencioso && !getCached<Publicacion[]>(`publicaciones:evento:${eventoId}`)) {
        setLoadingPublicaciones(false);
      }
    }
  };

  const refrescarPersonasYConexiones = async () => {
    try {
      if (!id || !usuarioActualId) return;

      const [
        responseAsistencias,
        responseConexiones,
        responseSolicitudes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/asistencias/evento/${id}`),
        fetch(`${API_URL}/api/conexiones/usuario/${usuarioActualId}`),
        fetch(`${API_URL}/api/solicitudes-conexion/pendientes/${usuarioActualId}`),
      ]);

      const dataAsistencias = await responseAsistencias.json();

      if (responseAsistencias.ok) {
        setAsistencias(dataAsistencias.asistencias || []);
      }

      const dataConexiones = await responseConexiones.json();

      if (responseConexiones.ok) {
        const conexionesObtenidas = dataConexiones || [];
        setConexiones(conexionesObtenidas);

        const idsAmigos = conexionesObtenidas.map((conexion: Conexion) => {
          const usuario1Id = obtenerUsuarioId(conexion.usuario1);
          const usuario2Id = obtenerUsuarioId(conexion.usuario2);

          if (usuario1Id === usuarioActualId) {
            return usuario2Id;
          }

          return usuario1Id;
        });

        setConexionesIds(idsAmigos.filter(Boolean));
      }

      const dataSolicitudes = await responseSolicitudes.json();

      if (responseSolicitudes.ok) {
        const idsPendientes = (dataSolicitudes.solicitudes || []).map(
          (solicitud: SolicitudConexion) => {
            const solicitanteId = obtenerUsuarioId(solicitud.usuariosolicitante);
            const receptorId = obtenerUsuarioId(solicitud.usuarioreceptor);

            if (solicitanteId === usuarioActualId) {
              return receptorId;
            }

            return solicitanteId;
          }
        );

        setSolicitudesPendientesIds(idsPendientes.filter(Boolean));
      }
    } catch (error) {
      console.log("Error refrescando personas:", error);
    }
  };

  useAutoRefresh(
    useCallback(() => refrescarPersonasYConexiones(), [id, usuarioActualId]),
    20000,
    !loading
  );

  const crearPublicacion = async () => {
    try {
      if (!nuevaPublicacion.trim()) {
        alert("Escribí algo para publicar.");
        return;
      }

      if (!usuarioActualId || !id) {
        alert("No se pudo identificar usuario o evento.");
        return;
      }

      const response = await fetch(`${API_URL}/api/publicaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId: usuarioActualId,
          eventoId: String(id),
          contenido: nuevaPublicacion.trim(),
          imagen: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo crear la publicación.");
        return;
      }

      const publicacionNueva: Publicacion = {
        ...data.publicacion,
        usuarioId:
          usuarioActual ||
          ({
            _id: usuarioActualId,
            nombre: "Yo",
          } as Usuario),
        createdAt: data.publicacion.createdAt || new Date().toISOString(),
      };

      setPublicaciones((prev) => [publicacionNueva, ...prev]);

      setComentariosPorPublicacion((prev) => ({
        ...prev,
        [publicacionNueva._id]: [],
      }));

      setNuevaPublicacion("");
      setModalPublicacionVisible(false);
    } catch (error) {
      console.log("Error al crear publicación:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const abrirPerfilUsuario = (usuarioId?: string) => {
    if (!usuarioId) return;
    router.push(`/user-profile/${usuarioId}` as any);
  };

  const obtenerConexionConUsuario = (usuarioId?: string) => {
    if (!usuarioId) return null;

    return (
      conexiones.find((conexion) => {
        const usuario1Id = obtenerUsuarioId(conexion.usuario1);
        const usuario2Id = obtenerUsuarioId(conexion.usuario2);

        return usuario1Id === usuarioId || usuario2Id === usuarioId;
      }) || null
    );
  };

  const abrirChat = async (conexion: Conexion, usuarioConexionId?: string) => {
    try {
      if (!usuarioActualId || !usuarioConexionId) return;

      const responseExistente = await fetch(
        `${API_URL}/api/chats/entre/${usuarioActualId}/${usuarioConexionId}`
      );

      if (responseExistente.ok) {
        const dataExistente = await responseExistente.json();
        router.push(`/chat/${dataExistente.chat._id}` as any);
        return;
      }

      const response = await fetch(`${API_URL}/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conexionId: conexion._id,
          participantes: [usuarioActualId, usuarioConexionId],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo abrir el chat.");
        return;
      }

      router.push(`/chat/${data.chat._id}` as any);
    } catch (error) {
      console.log("Error abriendo chat:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const enviarSolicitudConexion = async (usuarioReceptorId?: string) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        router.replace("/login" as any);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const usuarioSolicitanteId = usuario.id || usuario._id;

      if (!usuarioSolicitanteId || !usuarioReceptorId) {
        alert("No se pudo identificar a los usuarios.");
        return;
      }

      if (usuarioSolicitanteId === usuarioReceptorId) {
        alert("No podés conectarte con vos mismo.");
        return;
      }

      const response = await fetch(`${API_URL}/api/solicitudes-conexion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuariosolicitante: usuarioSolicitanteId,
          usuarioreceptor: usuarioReceptorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.mensaje || "No se pudo enviar la solicitud.");
        return;
      }

      setSolicitudesPendientesIds((prev) => {
        if (prev.includes(usuarioReceptorId)) {
          return prev;
        }

        return [...prev, usuarioReceptorId];
      });

      alert("Solicitud enviada correctamente.");
    } catch (error) {
      console.log("Error al enviar solicitud:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const obtenerInicial = (nombre?: string) => {
    if (!nombre) return "U";
    return nombre.charAt(0).toUpperCase();
  };

  const obtenerUsuarioId = (usuario?: Usuario) => {
    return usuario?._id || usuario?.id;
  };

  const esAmigo = (usuarioId?: string) => {
    if (!usuarioId) return false;
    return conexionesIds.includes(usuarioId);
  };

  const tieneSolicitudPendiente = (usuarioId?: string) => {
    if (!usuarioId) return false;
    return solicitudesPendientesIds.includes(usuarioId);
  };

  const obtenerUbicacionEvento = () => {
    if (!evento?.ubicacion) return "Ubicación a confirmar";

    if (evento.ubicacion.barrio) return evento.ubicacion.barrio;
    if (evento.ubicacion.ciudad) return evento.ubicacion.ciudad;
    if (evento.ubicacion.direccion) return evento.ubicacion.direccion;

    return "Ubicación a confirmar";
  };

  const asistenciasFiltradas = asistencias.filter((asistencia) => {
    const idUsuario = obtenerUsuarioId(asistencia.usuarioId);
    return idUsuario !== usuarioActualId;
  });

  const personasFiltradas = asistenciasFiltradas.filter((asistencia) => {
    const usuario = asistencia.usuarioId;
    const texto = busquedaPersonas.toLowerCase().trim();

    if (!texto) return true;

    const nombre = usuario?.nombre?.toLowerCase() || "";
    const nombreUsuario = usuario?.nombreUsuario?.toLowerCase() || "";
    const email = usuario?.email?.toLowerCase() || "";
    const bio = usuario?.bio?.toLowerCase() || "";
    const intereses = usuario?.intereses?.join(" ").toLowerCase() || "";

    return (
      nombre.includes(texto) ||
      nombreUsuario.includes(texto) ||
      email.includes(texto) ||
      bio.includes(texto) ||
      intereses.includes(texto)
    );
  });

  if (loading) {
    return <LoadingScreen text="Cargando personas..." />;
  }

  if (!evento) {
    return (
      <EmptyState
        title="No se encontró el evento"
        text="Volvé e intentá entrar nuevamente."
        buttonText="Volver"
        onPress={() => router.back()}
      />
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

            <Text style={styles.eventDate}>
              {formatearFechaLarga(evento.fecha)}
            </Text>

            <Text style={styles.eventLocation}>{obtenerUbicacionEvento()}</Text>

            <View style={styles.avatarRow}>
              {asistenciasFiltradas.slice(0, 3).map((asistencia, index) => (
                <TouchableOpacity
                  key={asistencia._id}
                  style={[styles.smallAvatar, index > 0 && styles.avatarOverlap]}
                  activeOpacity={0.85}
                  onPress={() =>
                    abrirPerfilUsuario(obtenerUsuarioId(asistencia.usuarioId))
                  }
                >
                  <Text style={styles.smallAvatarText}>
                    {obtenerInicial(asistencia.usuarioId?.nombre)}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.plusCircle}>
                <Plus size={13} color="#FFFFFF" />
              </View>

              <Text style={styles.moreText}>+{asistenciasFiltradas.length}</Text>
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
            <View style={styles.peopleSearchBox}>
              <Search size={18} color="#8B35E8" />
              <TextInput
                style={styles.peopleSearchInput}
                placeholder="Buscar personas por nombre o intereses..."
                placeholderTextColor="#A7A7B0"
                value={busquedaPersonas}
                onChangeText={setBusquedaPersonas}
              />
            </View>

            {asistenciasFiltradas.length === 0 ? (
              <EmptyState
                title="Todavía no hay otros interesados"
                text="Cuando otras personas toquen “Quiero ir”, van a aparecer en esta lista."
              />
            ) : personasFiltradas.length === 0 ? (
              <EmptyState
                title="No encontramos personas"
                text="Probá buscar otro nombre, email o interés."
              />
            ) : (
              personasFiltradas.map((asistencia) => {
                const usuario = asistencia.usuarioId;
                const receptorId = obtenerUsuarioId(usuario);
                const yaEsAmigo = esAmigo(receptorId);
                const solicitudPendiente = tieneSolicitudPendiente(receptorId);
                const conexion = obtenerConexionConUsuario(receptorId);
                const intereses = usuario?.intereses?.slice(0, 3) || [];

                return (
                  <View key={asistencia._id} style={styles.personCard}>
                    <ProfileAvatarLink usuario={usuario} size={54} />

                    <TouchableOpacity
                      style={styles.personInfo}
                      activeOpacity={0.85}
                      onPress={() => abrirPerfilUsuario(receptorId)}
                    >
                      <Text style={styles.personName}>
                        {usuario?.nombre || "Usuario"}
                      </Text>

                      <Text style={styles.personSubtitle}>
                        @{usuario?.nombreUsuario || "usuario"} ·{" "}
                        {usuario?.ubicacionAproximada || "Ubicación no cargada"}
                      </Text>

                      {intereses.length > 0 && (
                        <View style={styles.personChips}>
                          {intereses.map((interes) => (
                            <View key={interes} style={styles.personChip}>
                              <Text style={styles.personChipText}>{interes}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <Text
                        style={[
                          styles.statusText,
                          yaEsAmigo && styles.friendStatusText,
                          solicitudPendiente && styles.pendingStatusText,
                        ]}
                      >
                        {yaEsAmigo
                          ? "Ya son conexión, pueden coordinar"
                          : solicitudPendiente
                            ? "Solicitud pendiente"
                            : "También quiere ir a este evento"}
                      </Text>
                    </TouchableOpacity>

                    {yaEsAmigo ? (
                      <TouchableOpacity
                        style={styles.friendButton}
                        activeOpacity={0.85}
                        onPress={() => conexion && abrirChat(conexion, receptorId)}
                      >
                        <MessageCircle size={20} color="#12A150" />
                      </TouchableOpacity>
                    ) : solicitudPendiente ? (
                      <View style={styles.pendingButton}>
                        <Clock3 size={21} color="#8B35E8" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.connectButton}
                        activeOpacity={0.85}
                        onPress={() => enviarSolicitudConexion(receptorId)}
                      >
                        <UserPlus size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {tabActiva === "publicaciones" && (
          <View style={styles.publicacionesContainer}>
            <TouchableOpacity
              style={styles.openPostButton}
              activeOpacity={0.85}
              onPress={() => setModalPublicacionVisible(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.openPostButtonText}>Crear publicación</Text>
            </TouchableOpacity>

            {loadingPublicaciones ? (
              <Text style={styles.loadingPublicacionesText}>
                Cargando publicaciones...
              </Text>
            ) : publicaciones.length === 0 ? (
              <EmptyState
                title="Todavía no hay publicaciones"
                text="Sé la primera persona en publicar algo sobre este evento."
              />
            ) : (
              publicaciones.map((publicacion) => {
                const comentarios = comentariosPorPublicacion[publicacion._id] || [];

                return (
                  <PublicationPreviewCard
                    key={publicacion._id}
                    publicacion={publicacion}
                    comentariosCount={comentarios.length}
                    onPress={() =>
                      router.push(`/publication-detail/${publicacion._id}` as any)
                    }
                  />
                );
              })
            )}
          </View>
        )}

        {tabActiva === "info" && (
          <View style={styles.infoCard}>
            <SectionHeader title="Información del evento" />

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

      <CreatePublicationModal
        visible={modalPublicacionVisible}
        usuarioActual={usuarioActual}
        texto={nuevaPublicacion}
        onChangeTexto={setNuevaPublicacion}
        onClose={() => {
          setModalPublicacionVisible(false);
          setNuevaPublicacion("");
        }}
        onPublish={crearPublicacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F5FF",
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
  peopleSearchBox: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0D9F4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  peopleSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#332047",
    outlineStyle: "none" as any,
  },
  personCard: {
    minHeight: 94,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  personInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2D2934",
    marginBottom: 3,
  },
  personSubtitle: {
    fontSize: 12,
    color: "#8D8A99",
    marginBottom: 3,
  },
  personChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  personChip: {
    backgroundColor: "#F1ECFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  personChipText: {
    fontSize: 10,
    color: "#7528F0",
    fontWeight: "900",
  },
  statusText: {
    fontSize: 12,
    color: "#7528F0",
    fontWeight: "800",
  },
  friendStatusText: {
    color: "#12A150",
  },
  pendingStatusText: {
    color: "#8B35E8",
  },
  connectButton: {
    width: 54,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#B484F2",
    alignItems: "center",
    justifyContent: "center",
  },
  friendButton: {
    width: 54,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingButton: {
    width: 54,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
  },

  publicacionesContainer: {
    paddingBottom: 24,
  },
  openPostButton: {
    height: 50,
    borderRadius: 24,
    backgroundColor: "#8B35E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  openPostButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
  loadingPublicacionesText: {
    textAlign: "center",
    color: "#8D8A99",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
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
