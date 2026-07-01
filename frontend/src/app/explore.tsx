import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Search } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Interes } from "../types/Interes";
import Logo from "../components/Logo";
import { API_URL } from "../config/api";
import BottomNav from "../components/BottomNav";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import EventListCard from "../components/EventListCard";
import SectionHeader from "../components/SectionHeader";
import InterestChips from "../components/InterestChips";
import UserSearchCard from "../components/UserSearchCard";
 
import { Evento } from "../types/Evento";
import { Usuario } from "../types/Usuario";
import { getCached, setCached } from "../utils/cache";
import { eventoYaPaso } from "../utils/eventHelpers";
 
type EstadoConexion = "conectado" | "pendiente" | "ninguno";
 
type Favorito = {
  _id: string;
  eventoId: Evento | string;
};
 
export default function ExploreScreen() {
  const params = useLocalSearchParams();
 
  // ── Modo de búsqueda ──────────────────────────────────────────
  const [modo, setModo] = useState<"eventos" | "personas">("eventos");
 
  // ── Eventos ───────────────────────────────────────────────────
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [interesesDisponibles, setInteresesDisponibles] = useState<Interes[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [tituloPersonalizado, setTituloPersonalizado] = useState("");
  const [buscoAlgo, setBuscoAlgo] = useState(false);
 
  // ── Personas ──────────────────────────────────────────────────
  const [personas, setPersonas] = useState<Usuario[]>([]);
  const [conexionesIds, setConexionesIds] = useState<string[]>([]);
  const [solicitudesPendientesIds, setSolicitudesPendientesIds] = useState<string[]>([]);
  const [buscandoPersonas, setBuscandoPersonas] = useState(false);
  const [buscoBusqueda, setBuscoBusqueda] = useState(false);
 
  // ── Compartido ────────────────────────────────────────────────
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
 
  // Debounce de personas
  const timerPersonas = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  useFocusEffect(
    useCallback(() => {
      const iniciarPantalla = async () => {
        try {
          const usuarioGuardado = await AsyncStorage.getItem("usuario");
          if (!usuarioGuardado) { router.replace("/login" as any); return; }
 
          const usuario = JSON.parse(usuarioGuardado);
          const usuarioId = usuario.id || usuario._id;
 
          if (usuarioId) {
            cargarFavoritos(usuarioId);
            cargarConexionesYSolicitudes(usuarioId);
          }
 
          const cacheKey = await obtenerCacheKeyInicial();
          const eventosCacheados = cacheKey ? getCached<Evento[]>(cacheKey) : null;
          const interesesCacheados = getCached<Interes[]>("intereses:todos");
 
          setLoading(!eventosCacheados);
          if (eventosCacheados) setEventos(eventosCacheados);
          if (interesesCacheados) setInteresesDisponibles(interesesCacheados);
 
          cargarIntereses();
 
          if (params.filtro === "promocionados") {
            setBuscoAlgo(true); setCategoriaActiva(""); setTextoBusqueda("");
            setTituloPersonalizado("Eventos destacados");
            await obtenerEventosPromocionados(); return;
          }
          if (params.filtro === "recomendados") {
            setBuscoAlgo(true); setCategoriaActiva(""); setTextoBusqueda("");
            setTituloPersonalizado("Recomendados para vos");
            await obtenerEventosRecomendadosDelUsuario(); return;
          }
          if (params.categoria) { await filtrarPorCategoria(String(params.categoria)); return; }
 
          await obtenerTodosLosEventos();
        } catch (error) {
          console.log("Error al iniciar búsqueda:", error);
        } finally {
          setLoading(false);
        }
      };
      iniciarPantalla();
    }, [params.filtro, params.categoria])
  );
 
  // ── Conexiones y solicitudes del usuario actual ───────────────
  const cargarConexionesYSolicitudes = async (usuarioId: string) => {
    try {
      const [resConexiones, resSolicitudes] = await Promise.all([
        fetch(`${API_URL}/api/conexiones/usuario/${usuarioId}`),
        fetch(`${API_URL}/api/solicitudes-conexion/pendientes/${usuarioId}`),
      ]);
 
      if (resConexiones.ok) {
        const data = await resConexiones.json();
        const ids = (data.conexiones || []).map((c: any) => {
          const u1 = c.usuario1?._id || c.usuario1;
          const u2 = c.usuario2?._id || c.usuario2;
          return u1 === usuarioId ? u2 : u1;
        }).filter(Boolean);
        setConexionesIds(ids);
      }
 
      if (resSolicitudes.ok) {
        const data = await resSolicitudes.json();
        const ids = (data.solicitudes || []).map((s: any) => {
          const solicitanteId = s.usuariosolicitante?._id || s.usuariosolicitante;
          const receptorId = s.usuarioreceptor?._id || s.usuarioreceptor;
          return solicitanteId === usuarioId ? receptorId : solicitanteId;
        }).filter(Boolean);
        setSolicitudesPendientesIds(ids);
      }
    } catch (error) {
      console.log("Error cargando conexiones/solicitudes:", error);
    }
  };
 
  const obtenerEstadoConexion = (usuarioId: string): EstadoConexion => {
    if (conexionesIds.includes(usuarioId)) return "conectado";
    if (solicitudesPendientesIds.includes(usuarioId)) return "pendiente";
    return "ninguno";
  };
 
  // ── Búsqueda de personas ──────────────────────────────────────
  const buscarPersonas = (texto: string) => {
    setTextoBusqueda(texto);
    setBuscoBusqueda(true);
 
    if (timerPersonas.current) clearTimeout(timerPersonas.current);
 
    const textoLimpio = texto.trim();
    if (textoLimpio.length < 2) {
      setPersonas([]);
      setBuscoBusqueda(textoLimpio.length > 0);
      return;
    }
 
    timerPersonas.current = setTimeout(async () => {
      try {
        setBuscandoPersonas(true);
        const response = await fetch(
          `${API_URL}/api/usuarios/buscar/${encodeURIComponent(textoLimpio)}`
        );
        const data = await response.json();
        if (response.ok) {
          setPersonas(data.usuarios || []);
        } else {
          setPersonas([]);
        }
      } catch (error) {
        console.log("Error buscando personas:", error);
        setPersonas([]);
      } finally {
        setBuscandoPersonas(false);
      }
    }, 350);
  };
 
  const enviarSolicitudConexion = async (usuarioReceptorId: string) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");
      if (!usuarioGuardado) { router.replace("/login" as any); return; }
      const usuario = JSON.parse(usuarioGuardado);
      const usuarioSolicitanteId = usuario.id || usuario._id;
 
      if (!usuarioSolicitanteId || !usuarioReceptorId) return;
      if (usuarioSolicitanteId === usuarioReceptorId) {
        alert("No podés conectarte con vos mismo.");
        return;
      }
 
      const response = await fetch(`${API_URL}/api/solicitudes-conexion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
 
      setSolicitudesPendientesIds((prev) =>
        prev.includes(usuarioReceptorId) ? prev : [...prev, usuarioReceptorId]
      );
      alert("¡Solicitud enviada!");
    } catch (error) {
      console.log("Error enviando solicitud:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
 
  // ── Intereses ─────────────────────────────────────────────────
  const cargarIntereses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/intereses`);
      const data = await response.json();
      if (!response.ok) return;
      setInteresesDisponibles(data.intereses || []);
      setCached("intereses:todos", data.intereses || []);
    } catch (error) {
      console.log("Error al cargar intereses:", error);
    }
  };
 
  const obtenerUsuarioId = async () => {
    const usuarioGuardado = await AsyncStorage.getItem("usuario");
    if (!usuarioGuardado) { router.replace("/login" as any); return null; }
    const usuario = JSON.parse(usuarioGuardado);
    return usuario.id || usuario._id || null;
  };
 
  const cargarFavoritos = async (usuarioId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/favoritos/usuario/${usuarioId}`);
      const data = await response.json();
      if (!response.ok) return;
      const idsFavoritos = (data.favoritos || [])
        .map((favorito: Favorito) => {
          const evento = favorito.eventoId;
          return typeof evento === "string" ? evento : evento?._id;
        })
        .filter(Boolean);
      setFavoritos(idsFavoritos);
      await AsyncStorage.setItem("favoritos", JSON.stringify(idsFavoritos));
    } catch (error) {
      console.log("Error cargando favoritos:", error);
    }
  };
 
  const obtenerCacheKeyInicial = async () => {
    if (params.filtro === "promocionados") return "eventos:promocionados";
    if (params.filtro === "recomendados") {
      const usuarioId = await obtenerUsuarioId();
      return usuarioId ? `eventos:recomendados:${usuarioId}` : null;
    }
    if (params.categoria) return `eventos:categoria:${String(params.categoria)}`;
    return "eventos:todos";
  };
 
  const obtenerTodosLosEventos = async () => {
    try {
      const cacheKey = "eventos:todos";
      const eventosCacheados = getCached<Evento[]>(cacheKey);
      if (eventosCacheados) {
        setEventos(eventosCacheados.filter((e) => !eventoYaPaso(e.fecha)));
        setBuscoAlgo(false); setCategoriaActiva(""); setTituloPersonalizado("");
        setLoading(false);
      }
      const response = await fetch(`${API_URL}/api/eventos`);
      const data = await response.json();
      if (!response.ok) { alert(data.message || data.error || "Error al traer eventos."); return; }
      const eventosFiltrados = (data.eventos || []).filter((e: Evento) => !eventoYaPaso(e.fecha));
      setEventos(eventosFiltrados);
      setCached(cacheKey, data.eventos || []);
      (data.eventos || []).forEach((evento: Evento) => {
        if (evento._id) setCached(`evento:${evento._id}`, evento);
      });
      setBuscoAlgo(false); setCategoriaActiva(""); setTituloPersonalizado("");
    } catch (error) {
      console.log("Error al traer eventos:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
 
  const obtenerEventosRecomendadosDelUsuario = async () => {
    try {
      const usuarioId = await obtenerUsuarioId();
      if (!usuarioId) { alert("No se encontró el usuario logueado."); return; }
      const cacheKey = `eventos:recomendados:${usuarioId}`;
      const eventosCacheados = getCached<Evento[]>(cacheKey);
      if (eventosCacheados) {
        setEventos(eventosCacheados); setBuscoAlgo(true); setCategoriaActiva("");
        setTituloPersonalizado("Recomendados para vos"); setLoading(false);
      }
      const response = await fetch(`${API_URL}/api/eventos/recomendados/${usuarioId}`);
      const data = await response.json();
      if (!response.ok) { alert(data.message || data.error || "Error al traer recomendados."); return; }
      setEventos(data.eventos || []);
      setCached(cacheKey, data.eventos || []);
      (data.eventos || []).forEach((evento: Evento) => {
        if (evento._id) setCached(`evento:${evento._id}`, evento);
      });
      setBuscoAlgo(true); setCategoriaActiva(""); setTituloPersonalizado("Recomendados para vos");
    } catch (error) {
      console.log("Error al traer recomendados:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
 
  const obtenerEventosPromocionados = async () => {
    try {
      const cacheKey = "eventos:promocionados";
      const eventosCacheados = getCached<Evento[]>(cacheKey);
      if (eventosCacheados) {
        setEventos(eventosCacheados.filter((e) => !eventoYaPaso(e.fecha)));
        setBuscoAlgo(true); setCategoriaActiva(""); setLoading(false);
      }
      const response = await fetch(`${API_URL}/api/eventos/promocionados`);
      const data = await response.json();
      if (!response.ok) { alert(data.message || data.error || "Error al traer destacados."); return; }
      const eventosPromocionados = (data.eventos || []).filter((e: Evento) => !eventoYaPaso(e.fecha));
      setEventos(eventosPromocionados);
      setCached(cacheKey, eventosPromocionados);
      eventosPromocionados.forEach((evento: Evento) => {
        if (evento._id) setCached(`evento:${evento._id}`, evento);
      });
      setBuscoAlgo(true); setCategoriaActiva("");
    } catch (error) {
      console.log("Error al traer promocionados:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
 
  const buscarEventos = async (texto: string) => {
    setTextoBusqueda(texto);
    setCategoriaActiva("");
    const textoLimpio = texto.trim();
    if (textoLimpio.length === 0) { setBuscoAlgo(false); await obtenerEventosRecomendadosDelUsuario(); return; }
    const caracteresValidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;
    if (!caracteresValidos.test(textoLimpio)) { setBuscoAlgo(true); setEventos([]); return; }
    try {
      setBuscoAlgo(true);
      const response = await fetch(`${API_URL}/api/eventos/buscar/${encodeURIComponent(textoLimpio)}`);
      const data = await response.json();
      if (!response.ok) { setEventos([]); return; }
      const eventosFiltrados = (data.eventos || []).filter((e: Evento) => !eventoYaPaso(e.fecha));
      setEventos(eventosFiltrados);
    } catch (error) {
      console.log("Error al buscar eventos:", error);
      setEventos([]);
    }
  };
 
  const filtrarPorCategoria = async (categoria: string) => {
    try {
      const cacheKey = `eventos:categoria:${categoria}`;
      const eventosCacheados = getCached<Evento[]>(cacheKey);
      setLoading(!eventosCacheados); setBuscoAlgo(true); setCategoriaActiva(categoria);
      setTextoBusqueda(""); setTituloPersonalizado("");
      if (eventosCacheados) setEventos(eventosCacheados.filter((e) => !eventoYaPaso(e.fecha)));
      const response = await fetch(`${API_URL}/api/eventos/categoria/${categoria}`);
      const data = await response.json();
      if (!response.ok) { alert(data.message || data.error || "Error al filtrar eventos."); return; }
      const eventosFiltrados = (data.eventos || []).filter((e: Evento) => !eventoYaPaso(e.fecha));
      setEventos(eventosFiltrados);
      setCached(cacheKey, data.eventos || []);
      (data.eventos || []).forEach((evento: Evento) => {
        if (evento._id) setCached(`evento:${evento._id}`, evento);
      });
    } catch (error) {
      console.log("Error al filtrar categoría:", error);
      alert("No se pudo conectar con el servidor.");
    } finally { setLoading(false); }
  };
 
  const limpiarFiltros = async () => {
    setTextoBusqueda(""); setCategoriaActiva(""); setBuscoAlgo(false);
    setTituloPersonalizado(""); setPersonas([]); setBuscoBusqueda(false);
    await obtenerTodosLosEventos();
  };
 
  const toggleFavorito = async (eventoId: string) => {
    try {
      const usuarioId = await obtenerUsuarioId();
      if (!usuarioId) return;
      if (favoritos.includes(eventoId)) {
        const responseFavoritos = await fetch(`${API_URL}/api/favoritos/usuario/${usuarioId}`);
        const dataFavoritos = await responseFavoritos.json();
        if (!responseFavoritos.ok) { alert(dataFavoritos.error || "No se pudo leer favoritos."); return; }
        const favorito = (dataFavoritos.favoritos || []).find((item: Favorito) => {
          const evento = item.eventoId;
          const idEvento = typeof evento === "string" ? evento : evento?._id;
          return idEvento === eventoId;
        });
        if (favorito?._id) {
          const response = await fetch(`${API_URL}/api/favoritos/${favorito._id}`, { method: "DELETE" });
          const data = await response.json();
          if (!response.ok) { alert(data.error || "No se pudo sacar de favoritos."); return; }
        }
        const nuevosFavoritos = favoritos.filter((id) => id !== eventoId);
        setFavoritos(nuevosFavoritos);
        await AsyncStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
        return;
      }
      const response = await fetch(`${API_URL}/api/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, eventoId }),
      });
      const data = await response.json();
      if (!response.ok && data.error !== "El evento ya está en favoritos") {
        alert(data.error || "No se pudo guardar el evento."); return;
      }
      const nuevosFavoritos = [...favoritos, eventoId];
      setFavoritos(nuevosFavoritos);
      await AsyncStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));
    } catch (error) {
      console.log("Error actualizando favorito:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
 
  const esFavorito = (eventoId: string) => favoritos.includes(eventoId);
 
  const irADetalle = async (eventoId: string) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");
      if (!usuarioGuardado) { router.replace("/login" as any); return; }
      const usuario = JSON.parse(usuarioGuardado);
      const usuarioId = usuario.id || usuario._id;
      if (!usuarioId) { router.push(`/event-detail/${eventoId}` as any); return; }
      const response = await fetch(`${API_URL}/api/asistencias/usuario/${usuarioId}`);
      const data = await response.json();
      if (!response.ok) { router.push(`/event-detail/${eventoId}` as any); return; }
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
      router.push(`/event-detail/${eventoId}` as any);
    }
  };
 
  const obtenerNombreCategoriaActiva = () => {
    const interes = interesesDisponibles.find((item) => item.slug === categoriaActiva);
    return interes?.nombre || categoriaActiva;
  };
 
  const obtenerTituloSeccion = () => {
    if (tituloPersonalizado) return tituloPersonalizado;
    if (params.filtro === "promocionados") return "Eventos destacados";
    if (params.filtro === "recomendados") return "Recomendados para vos";
    if (categoriaActiva) return `Eventos de ${obtenerNombreCategoriaActiva()}`;
    if (buscoAlgo) return "Resultados";
    return "Eventos";
  };
 
  const cambiarModo = (nuevoModo: "eventos" | "personas") => {
    setModo(nuevoModo);
    setTextoBusqueda("");
    setPersonas([]);
    setBuscoBusqueda(false);
  };
 
  if (loading) return <LoadingScreen text="Cargando búsqueda..." />;
 
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Logo size="large" centered={true} showText={false} />
 
        {/* Toggle Eventos / Personas */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, modo === "eventos" && styles.toggleBtnActivo]}
            onPress={() => cambiarModo("eventos")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, modo === "eventos" && styles.toggleTextActivo]}>
              Eventos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, modo === "personas" && styles.toggleBtnActivo]}
            onPress={() => cambiarModo("personas")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, modo === "personas" && styles.toggleTextActivo]}>
              Personas
            </Text>
          </TouchableOpacity>
        </View>
 
        {/* Buscador */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#A7A7B0" />
            <TextInput
              placeholder={modo === "personas" ? "Buscar por nombre o @usuario..." : "Buscar eventos..."}
              placeholderTextColor="#A7A7B0"
              style={styles.input}
              value={textoBusqueda}
              onChangeText={modo === "personas" ? buscarPersonas : buscarEventos}
            />
          </View>
        </View>
 
        {/* ── MODO PERSONAS ─────────────────────────────────────── */}
        {modo === "personas" && (
          <>
            {!buscoBusqueda && (
              <EmptyState
                icon={<Search size={54} color="#8B35E8" />}
                title="Buscá personas"
                text="Escribí el nombre o @usuario de alguien que conozcas para conectarte."
              />
            )}
 
            {buscoBusqueda && textoBusqueda.trim().length < 2 && (
              <View style={styles.noResultsCard}>
                <Text style={styles.noResultsTitle}>Seguí escribiendo</Text>
                <Text style={styles.noResultsText}>
                  Ingresá al menos 2 caracteres para buscar.
                </Text>
              </View>
            )}
 
            {buscandoPersonas && (
              <Text style={styles.buscandoText}>Buscando...</Text>
            )}
 
            {!buscandoPersonas && buscoBusqueda && textoBusqueda.trim().length >= 2 && (
              <>
                <SectionHeader
                  title={`Personas (${personas.length})`}
                  actionText="Limpiar"
                  onPress={limpiarFiltros}
                />
                {personas.length === 0 ? (
                  <View style={styles.noResultsCard}>
                    <Text style={styles.noResultsTitle}>Sin resultados</Text>
                    <Text style={styles.noResultsText}>
                      No encontramos a nadie con ese nombre o usuario.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.personasList}>
                    {personas.map((persona) => {
                      const pid = persona._id || persona.id || "";
                      return (
                        <UserSearchCard
                          key={pid}
                          usuario={persona}
                          estadoConexion={obtenerEstadoConexion(pid)}
                          onConectar={enviarSolicitudConexion}
                        />
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </>
        )}
 
        {/* ── MODO EVENTOS ──────────────────────────────────────── */}
        {modo === "eventos" && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
            >
              <InterestChips
                intereses={interesesDisponibles}
                seleccionado={categoriaActiva}
                onPress={filtrarPorCategoria}
                variant="explore"
              />
            </ScrollView>
 
            {!buscoAlgo && (
              <EmptyState
                icon={<Search size={54} color="#8B35E8" />}
                title="Todavía no buscaste nada"
                text="Explorá eventos, personas o lugares para encontrar con quién ir."
              />
            )}
 
            <SectionHeader
              title={obtenerTituloSeccion()}
              actionText="Limpiar"
              onPress={limpiarFiltros}
            />
 
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
                  <EventListCard
                    key={evento._id}
                    evento={evento}
                    status={eventoYaPaso(evento.fecha) ? "Evento finalizado" : undefined}
                    showHeart
                    isFavorite={esFavorito(evento._id)}
                    onHeartPress={() => toggleFavorito(evento._id)}
                    onPress={() => irADetalle(evento._id)}
                  />
                ))}
              </View>
            )}
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
    backgroundColor: "#F7F5FF",
  },
  container: {
    paddingHorizontal: 28,
    paddingTop: 62,
    paddingBottom: 130,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#EEEBF8",
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  toggleBtnActivo: {
    backgroundColor: "#8B35E8",
    shadowColor: "#8B35E8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8D8A99",
  },
  toggleTextActivo: {
    color: "#FFFFFF",
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
    borderColor: "#E6E0F4",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: "#332047",
    outlineStyle: "none" as any,
  },
  categories: {
    marginBottom: 34,
  },
  eventsList: {
    marginBottom: 24,
  },
  personasList: {
    marginBottom: 24,
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
  buscandoText: {
    textAlign: "center",
    color: "#8D8A99",
    fontSize: 14,
    marginVertical: 20,
  },
});