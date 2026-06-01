import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { MessageCircle, UserPlus, Clock, Check } from "lucide-react-native";

import BottomNav from "../components/BottomNav";

const conexiones = [
  {
    id: "1",
    nombre: "Valentina Martínez",
    edad: 24,
    ubicacion: "Monte Grande",
    evento: "FUTTURA",
    estado: "aceptada",
    intereses: ["techno", "festivales"],
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
  },
  {
    id: "2",
    nombre: "Facundo Castillo",
    edad: 20,
    ubicacion: "Olivos",
    evento: "Lollapalooza Argentina 2026",
    estado: "aceptada",
    intereses: ["recitales", "rock"],
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
  },
  {
    id: "3",
    nombre: "Luz Barrientos",
    edad: 22,
    ubicacion: "Villa Urquiza",
    evento: "Techno Night BA",
    estado: "pendiente",
    intereses: ["techno", "fiesta"],
    foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300",
  },
];

const solicitudes = [
  {
    id: "4",
    nombre: "Sofía Rubachin",
    edad: 22,
    ubicacion: "Almagro",
    evento: "Teatro Gran Rex",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
  },
];

export default function ConnectionsScreen() {
  const conexionesAceptadas = conexiones.filter(
    (conexion) => conexion.estado === "aceptada"
  );

  const conexionesPendientes = conexiones.filter(
    (conexion) => conexion.estado === "pendiente"
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Conexiones</Text>

        <Text style={styles.subtitle}>
          Personas con las que conectaste para compartir eventos.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{conexionesAceptadas.length}</Text>
            <Text style={styles.summaryLabel}>Conectadas</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{conexionesPendientes.length}</Text>
            <Text style={styles.summaryLabel}>Pendientes</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{solicitudes.length}</Text>
            <Text style={styles.summaryLabel}>Solicitudes</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Solicitudes recibidas</Text>
          <Text style={styles.seeAll}>Ver todas</Text>
        </View>

        {solicitudes.map((solicitud) => (
          <View key={solicitud.id} style={styles.requestCard}>
            <Image source={{ uri: solicitud.foto }} style={styles.avatar} />

            <View style={styles.userInfo}>
              <Text style={styles.name}>{solicitud.nombre}</Text>
              <Text style={styles.detail}>
                {solicitud.ubicacion}, {solicitud.edad} años
              </Text>
              <Text style={styles.eventText}>
                Quiere conectar por {solicitud.evento}
              </Text>
            </View>

            <TouchableOpacity style={styles.acceptButton} activeOpacity={0.85}>
              <Check size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis conexiones</Text>
          <Text style={styles.seeAll}>Ver todas</Text>
        </View>

        {conexionesAceptadas.map((conexion) => (
          <View key={conexion.id} style={styles.connectionCard}>
            <Image source={{ uri: conexion.foto }} style={styles.avatar} />

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{conexion.nombre}</Text>

                <View style={styles.statusAccepted}>
                  <Text style={styles.statusAcceptedText}>Activa</Text>
                </View>
              </View>

              <Text style={styles.detail}>
                {conexion.ubicacion}, {conexion.edad} años
              </Text>

              <Text style={styles.eventText}>
                Conectaron por {conexion.evento}
              </Text>

              <View style={styles.chipsRow}>
                {conexion.intereses.map((interes) => (
                  <View key={interes} style={styles.chip}>
                    <Text style={styles.chipText}>{interes}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.messageButton} activeOpacity={0.85}>
              <MessageCircle size={20} color="#7528F0" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pendientes</Text>
        </View>

        {conexionesPendientes.map((conexion) => (
          <View key={conexion.id} style={styles.pendingCard}>
            <Image source={{ uri: conexion.foto }} style={styles.avatar} />

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{conexion.nombre}</Text>

                <View style={styles.statusPending}>
                  <Clock size={12} color="#8B35E8" />
                  <Text style={styles.statusPendingText}>Pendiente</Text>
                </View>
              </View>

              <Text style={styles.detail}>
                {conexion.ubicacion}, {conexion.edad} años
              </Text>

              <Text style={styles.eventText}>
                Solicitud enviada por {conexion.evento}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.emptyInfoCard}>
          <UserPlus size={26} color="#7528F0" />

          <View style={styles.emptyInfoTextBox}>
            <Text style={styles.emptyInfoTitle}>Conectá desde eventos</Text>
            <Text style={styles.emptyInfoText}>
              Cuando veas personas interesadas en un evento, podés enviarles una
              solicitud para ir juntos.
            </Text>
          </View>
        </View>
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
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    boxShadow: "0px 8px 18px rgba(0,0,0,0.06)" as any,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#7528F0",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8D8A99",
    fontWeight: "700",
  },
  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#EEEAF7",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#2D2934",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7528F0",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    boxShadow: "0px 8px 16px rgba(117,40,240,0.12)" as any,
  },
  connectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    boxShadow: "0px 8px 16px rgba(0,0,0,0.07)" as any,
  },
  pendingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E8DDFF",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2D2934",
    flex: 1,
  },
  detail: {
    fontSize: 12,
    color: "#8D8A99",
    marginBottom: 4,
  },
  eventText: {
    fontSize: 12,
    color: "#5F5C68",
    fontWeight: "600",
    marginBottom: 7,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#F1ECFF",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7528F0",
  },
  acceptButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#8B35E8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  statusAccepted: {
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusAcceptedText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#12A150",
  },
  statusPending: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1ECFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPendingText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#8B35E8",
    marginLeft: 4,
  },
  emptyInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    marginTop: 8,
  },
  emptyInfoTextBox: {
    flex: 1,
    marginLeft: 14,
  },
  emptyInfoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#332047",
    marginBottom: 5,
  },
  emptyInfoText: {
    fontSize: 13,
    color: "#8D8A99",
    lineHeight: 19,
  },
});