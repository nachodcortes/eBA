import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { UserPlus, Clock3, Check } from "lucide-react-native";
import UserAvatar from "./UserAvatar";
import { Usuario } from "../types/Usuario";
 
type EstadoConexion = "conectado" | "pendiente" | "ninguno";
 
type Props = {
  usuario: Usuario;
  estadoConexion: EstadoConexion;
  onConectar: (usuarioId: string) => void;
};
 
export default function UserSearchCard({ usuario, estadoConexion, onConectar }: Props) {
  const usuarioId = usuario._id || usuario.id || "";
 
  const irAPerfil = () => {
    if (!usuarioId) return;
    router.push({ pathname: "/user-profile/[id]", params: { id: usuarioId } } as any);
  };
 
  const renderBoton = () => {
    if (estadoConexion === "conectado") {
      return (
        <View style={[styles.boton, styles.botonConectado]}>
          <Check size={14} color="#8B35E8" />
          <Text style={[styles.botonTexto, styles.botonTextoConectado]}>Conectado</Text>
        </View>
      );
    }
 
    if (estadoConexion === "pendiente") {
      return (
        <View style={[styles.boton, styles.botonPendiente]}>
          <Clock3 size={14} color="#A8A5B3" />
          <Text style={[styles.botonTexto, styles.botonTextoPendiente]}>Pendiente</Text>
        </View>
      );
    }
 
    return (
      <TouchableOpacity
        style={[styles.boton, styles.botonConectar]}
        onPress={() => onConectar(usuarioId)}
        activeOpacity={0.8}
      >
        <UserPlus size={14} color="#FFFFFF" />
        <Text style={[styles.botonTexto, styles.botonTextoConectar]}>Conectar</Text>
      </TouchableOpacity>
    );
  };
 
  return (
    <TouchableOpacity style={styles.card} onPress={irAPerfil} activeOpacity={0.85}>
      <UserAvatar usuario={usuario} size={46} />
 
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>{usuario.nombre}</Text>
        {usuario.nombreUsuario ? (
          <Text style={styles.nombreUsuario} numberOfLines={1}>@{usuario.nombreUsuario}</Text>
        ) : null}
        {usuario.bio ? (
          <Text style={styles.bio} numberOfLines={1}>{usuario.bio}</Text>
        ) : null}
      </View>
 
      {renderBoton()}
    </TouchableOpacity>
  );
}
 
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  nombre: {
    fontSize: 15,
    fontWeight: "800",
    color: "#332047",
  },
  nombreUsuario: {
    fontSize: 13,
    color: "#8B35E8",
    fontWeight: "600",
    marginTop: 1,
  },
  bio: {
    fontSize: 12,
    color: "#8D8A99",
    marginTop: 3,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  botonConectar: {
    backgroundColor: "#8B35E8",
  },
  botonPendiente: {
    backgroundColor: "#F0ECF8",
  },
  botonConectado: {
    backgroundColor: "#F0ECF8",
  },
  botonTexto: {
    fontSize: 13,
    fontWeight: "700",
  },
  botonTextoConectar: {
    color: "#FFFFFF",
  },
  botonTextoPendiente: {
    color: "#A8A5B3",
  },
  botonTextoConectado: {
    color: "#8B35E8",
  },
});