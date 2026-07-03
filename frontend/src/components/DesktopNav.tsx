import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, usePathname } from "expo-router";
import {
  CalendarDays,
  Home,
  IdCard,
  MessageCircle,
  PlusCircle,
  ShieldCheck,
  User,
  Users,
} from "lucide-react-native";

import Logo from "./Logo";
import { obtenerUsuarioActualizado } from "../utils/usuario";

const NAV_ITEMS_USUARIO = [
  {
    label: "Home",
    route: "/home",
    icon: Home,
    matches: ["/home", "/explore", "/event-detail", "/event-people"],
  },
  {
    label: "Chats",
    route: "/chats",
    icon: MessageCircle,
    matches: ["/chats", "/chat"],
  },
  {
    label: "Conexiones",
    route: "/connections",
    icon: Users,
    matches: ["/connections", "/user-profile"],
  },
  {
    label: "eBA Organizadores",
    route: "/ser-organizador",
    icon: IdCard,
    matches: ["/ser-organizador"],
  },
  {
    label: "Perfil",
    route: "/profile",
    icon: User,
    matches: ["/profile", "/edit-profile", "/favorites", "/notifications"],
  },
];

const NAV_ITEMS_ORGANIZADOR = [
  {
    label: "Home",
    route: "/home",
    icon: Home,
    matches: ["/home", "/explore", "/event-detail", "/event-people"],
  },
  {
    label: "Chats",
    route: "/chats",
    icon: MessageCircle,
    matches: ["/chats", "/chat"],
  },
  {
    label: "Conexiones",
    route: "/connections",
    icon: Users,
    matches: ["/connections", "/user-profile"],
  },
  {
    label: "Mis eventos",
    route: "/mis-eventos",
    icon: CalendarDays,
    matches: ["/mis-eventos", "/crear-evento"],
  },
  {
    label: "Perfil",
    route: "/profile",
    icon: User,
    matches: ["/profile", "/edit-profile", "/favorites", "/notifications"],
  },
];

const NAV_ITEMS_MANAGER = [
  {
    label: "Home",
    route: "/home",
    icon: Home,
    matches: ["/home", "/explore", "/event-detail", "/event-people"],
  },
  {
    label: "Crear evento",
    route: "/crear-evento",
    icon: PlusCircle,
    matches: ["/crear-evento"],
  },
  {
    label: "Verificación",
    route: "/manager",
    icon: ShieldCheck,
    matches: ["/manager"],
  },
  {
    label: "Organizadores",
    route: "/manager/organizadores",
    icon: IdCard,
    matches: ["/manager/organizadores"],
  },
  {
    label: "Perfil",
    route: "/profile",
    icon: User,
    matches: ["/profile", "/edit-profile", "/favorites", "/notifications"],
  },
];

export default function DesktopNav() {
  const pathname = usePathname();
  const [esManager, setEsManager] = useState(false);
  const [esOrganizador, setEsOrganizador] = useState(false);

  useEffect(() => {
    obtenerUsuarioActualizado().then((usuario) => {
      if (!usuario) return;

      setEsManager(!!usuario.esManager);
      setEsOrganizador(!!usuario.esOrganizador);
    });
  }, [pathname]);

  const items = esManager
    ? NAV_ITEMS_MANAGER
    : esOrganizador
    ? NAV_ITEMS_ORGANIZADOR
    : NAV_ITEMS_USUARIO;

  const rutaActiva = items.reduce(
    (mejor, item) => {
      const match = item.matches.find(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      if (match && match.length > mejor.length) return item.route;
      return mejor;
    },
    ""
  );

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoBox}>
        <Logo size="medium" centered={false} />
      </View>

      <View style={styles.items}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.route === rutaActiva;

          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.item, active && styles.itemActive]}
              activeOpacity={0.85}
              onPress={() => router.push(item.route as any)}
            >
              <Icon
                size={22}
                color={active ? "#6D28E8" : "#5E586E"}
                fill={active && item.route === "/home" ? "#6D28E8" : "transparent"}
              />
              <Text style={[styles.label, active && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: "fixed" as any,
    left: 0,
    top: 0,
    bottom: 0,
    width: 252,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E8E2F8",
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    zIndex: 50,
    boxShadow: "10px 0px 30px rgba(65,34,114,0.06)" as any,
  },
  logoBox: {
    marginBottom: 14,
  },
  items: {
    gap: 6,
  },
  item: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  itemActive: {
    backgroundColor: "#F1ECFF",
  },
  label: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#5E586E",
  },
  labelActive: {
    color: "#332047",
    fontWeight: "900",
  },
});
