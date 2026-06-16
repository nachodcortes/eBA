import { Pressable } from "react-native";
import { Link } from "expo-router";

import UserAvatar from "./UserAvatar";
import { Usuario } from "../types/Usuario";

type Props = {
  usuario?: Usuario | string | null;
  size?: number;
  disabled?: boolean;
  fallbackToProfile?: boolean;
};

export const obtenerUsuarioPerfilId = (usuario?: Usuario | string | null) => {
  if (!usuario) return null;
  if (typeof usuario === "string") return usuario;

  const id = usuario.id || usuario._id;

  return id ? String(id) : null;
};

export default function ProfileAvatarLink({
  usuario,
  size = 42,
  disabled = false,
  fallbackToProfile = false,
}: Props) {
  const usuarioId = obtenerUsuarioPerfilId(usuario);
  const usuarioAvatar =
    usuario && typeof usuario === "object" ? usuario : null;

  const avatar = <UserAvatar usuario={usuarioAvatar} size={size} />;

  if (disabled || (!usuarioId && !fallbackToProfile)) {
    return avatar;
  }

  const href = usuarioId
    ? ({
        pathname: "/user-profile/[id]",
        params: { id: usuarioId },
      } as const)
    : "/profile";

  return (
    <Link href={href as any} asChild>
      <Pressable hitSlop={10}>{avatar}</Pressable>
    </Link>
  );
}
