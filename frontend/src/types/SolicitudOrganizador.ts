import { Usuario } from "./Usuario";

export type EstadoSolicitudOrganizador = "pendiente" | "aprobado" | "rechazado";

export type SolicitudOrganizador = {
  _id: string;
  usuarioId: Usuario | string;
  fotoDocumento: string;
  estado: EstadoSolicitudOrganizador;
  motivoRechazo?: string;
  managerId?: string;
  createdAt?: string;
  revisadoEn?: string;
};
