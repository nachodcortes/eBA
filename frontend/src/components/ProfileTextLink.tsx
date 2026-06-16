import { Pressable } from "react-native";
import { Link } from "expo-router";
import { ReactNode } from "react";

import { obtenerUsuarioPerfilId } from "./ProfileAvatarLink";
import { Usuario } from "../types/Usuario";

type Props = {
  usuario?: Usuario | string | null;
  children: ReactNode;
  disabled?: boolean;
};

export default function ProfileTextLink({ usuario, children, disabled }: Props) {
  const usuarioId = obtenerUsuarioPerfilId(usuario);

  if (disabled || !usuarioId) {
    return <>{children}</>;
  }

  return (
    <Link
      href={
        {
          pathname: "/user-profile/[id]",
          params: { id: usuarioId },
        } as any
      }
      asChild
    >
      <Pressable hitSlop={8}>{children}</Pressable>
    </Link>
  );
}
