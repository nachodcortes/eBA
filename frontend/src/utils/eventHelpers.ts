import { API_URL } from "../config/api";
import { Ubicacion } from "../types/Evento";

export const obtenerImagen = (imagen?: string) => {
  if (!imagen || imagen.trim() === "") {
    return "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000";
  }

  if (imagen.startsWith("http")) {
    return imagen;
  }

  return `${API_URL}${imagen}`;
};

export const formatearFecha = (fecha?: string) => {
  if (!fecha) return "Fecha a confirmar";

  const fechaDate = new Date(fecha);

  if (isNaN(fechaDate.getTime())) {
    return fecha;
  }

  return fechaDate.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatearFechaLarga = (fecha?: string) => {
  if (!fecha) return "Fecha a confirmar";

  const fechaDate = new Date(fecha);

  if (isNaN(fechaDate.getTime())) {
    return fecha;
  }

  return fechaDate.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Convierte un ISO string (UTC) guardado en la base a "AAAA-MM-DD" en hora
// LOCAL, para que el input muestre el mismo día que el usuario cargó.
export const fechaISOaInputLocal = (fechaISO?: string) => {
  if (!fechaISO) return "";

  const fechaObj = new Date(fechaISO);

  if (isNaN(fechaObj.getTime())) return "";

  const anio = fechaObj.getFullYear();
  const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObj.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

// Convierte "AAAA-MM-DD" del input a un Date al mediodía LOCAL, para evitar
// que al pasar a UTC se corra al día anterior.
export const fechaInputAFechaLocal = (fechaInput: string) => {
  const [anio, mes, dia] = fechaInput.split("-").map(Number);
  return new Date(anio, (mes || 1) - 1, dia || 1, 12, 0, 0);
};

export const eventoYaPaso = (fecha?: string) => {
  if (!fecha) return false;

  const fechaDate = new Date(fecha);

  if (isNaN(fechaDate.getTime())) {
    return false;
  }

  return fechaDate.getTime() < Date.now();
};

export const obtenerUbicacion = (ubicacion?: Ubicacion) => {
  if (!ubicacion) return "Ubicación a confirmar";

  if (ubicacion.barrio && ubicacion.ciudad) {
    return `${ubicacion.barrio}, ${ubicacion.ciudad}`;
  }

  if (ubicacion.ciudad) return ubicacion.ciudad;
  if (ubicacion.direccion) return ubicacion.direccion;

  return "Ubicación a confirmar";
};