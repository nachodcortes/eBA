// seed-api.js
// Ejecutar con: node seed-api.js

const API_BASE = "http://localhost:3000/api";
// Para Vercel:
// const API_BASE = "https://e-ba.vercel.app/api";

const intereses = [
  { nombre: "Música", slug: "musica", icono: "music" },
  { nombre: "Tecnología", slug: "tecnologia", icono: "cpu" },
  { nombre: "Arte", slug: "arte", icono: "palette" },
  { nombre: "Diseño", slug: "diseno", icono: "pen-tool" },
  { nombre: "Deportes", slug: "deportes", icono: "trophy" },
  { nombre: "Gastronomía", slug: "gastronomia", icono: "utensils" },
  { nombre: "Networking", slug: "networking", icono: "users" },
  { nombre: "Emprendimientos", slug: "emprendimientos", icono: "rocket" },
  { nombre: "Educación", slug: "educacion", icono: "graduation-cap" },
  { nombre: "Bienestar", slug: "bienestar", icono: "heart" },
  { nombre: "Cine", slug: "cine", icono: "film" },
  { nombre: "Moda", slug: "moda", icono: "shopping-bag" },
];

const eventos = [
{
  nombre: "Aitana – Cuarto Azul World Tour",
  descripcion:
    "Aitana llega a Buenos Aires con su Cuarto Azul World Tour, una gira internacional que marca una nueva etapa en su carrera pop.",
  fecha: "2026-10-21T21:00:00.000-03:00",
  ubicacion: {
    nombre: "Movistar Arena",
    direccion: "Humboldt 450",
    ciudad: "CABA",
  },
  categoria: "musica",
  imagen:
    "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/aitana1500.jpg",
  imagenUrl:
    "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/aitana1500.jpg",
  cupo: 500,
  tags: ["pop", "aitana", "cuarto-azul", "internacional"],
},

{
  nombre: "Bad Gyal – Más Cara Tour",
  descripcion:
    "Bad Gyal llega a Buenos Aires con Más Cara Tour, una gira internacional que combina dancehall, reggaetón, música urbana y una puesta escénica de alto impacto.",
  fecha: "2026-10-18T21:00:00.000-03:00",
  ubicacion: {
    nombre: "Movistar Arena",
    direccion: "Humboldt 450",
    ciudad: "CABA",
  },
  categoria: "musica",
  imagen:
    "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/badgyal1500.jpg",
  imagenUrl:
    "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/badgyal1500.jpg",
  cupo: 500,
  tags: ["bad-gyal", "urbano", "reggaeton", "dancehall"],
},
];
const eventosNuevos = [
  {
    nombre: "Belkis Ayón. Mito y desobediencia",
    descripcion:
      "Primera exhibición en Argentina de la grabadora cubana Belkis Ayón, con obras centradas en el mito Abakuá. Inauguración gratuita en el Malba.",
    fecha: "2026-07-16T19:00:00.000-03:00",
    ubicacion: {
      nombre: "Malba",
      direccion: "Av. Figueroa Alcorta 3415",
      ciudad: "CABA",
    },
    categoria: "arte",
    imagen:
      "https://malba.org.ar/wp-content/uploads/2026/05/Belkis-Ayon-La-ultima-cena-detalle.jpg",
    imagenUrl:
      "https://malba.org.ar/wp-content/uploads/2026/05/Belkis-Ayon-La-ultima-cena-detalle.jpg",
    cupo: 300,
    tags: ["exposicion", "grabado", "arte-latinoamericano"],
  },
  {
    nombre: "Disney On Ice: ¡Festejemos en Familia!",
    descripcion:
      "Espectáculo sobre hielo con personajes de Frozen y Encanto, y el debut de Stitch en vivo. Función de apertura de la temporada de invierno.",
    fecha: "2026-07-17T18:00:00.000-03:00",
    ubicacion: {
      nombre: "Movistar Arena",
      direccion: "Humboldt 450",
      ciudad: "CABA",
    },
    categoria: "arte",
    imagen:
      "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/disney-onice-1500x610.jpg",
    imagenUrl:
      "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/disney-onice-1500x610.jpg",
    cupo: 500,
    tags: ["disney", "espectaculo-familiar", "patinaje"],
  },
  {
    nombre: "Rosalía – LUX Tour 2026",
    descripcion:
      "La artista española presenta su álbum LUX en su regreso a Buenos Aires, con una puesta visual, sinfónica y experimental.",
    fecha: "2026-08-02T21:00:00.000-03:00",
    ubicacion: {
      nombre: "Movistar Arena",
      direccion: "Humboldt 450",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen:
      "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/rosalia-lux1500.jpg",
    imagenUrl:
      "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/rosalia-lux1500.jpg",
    cupo: 500,
    tags: ["pop", "internacional", "lux-tour"],
  },
  {
    nombre: "NAKAMA: One Piece en Concierto",
    descripcion:
      "Estreno mundial de Power Up Orchestra con un show sinfónico dedicado al universo de One Piece.",
    fecha: "2026-08-10T21:00:00.000-03:00",
    ubicacion: {
      nombre: "Teatro Coliseo",
      direccion: "Marcelo T. de Alvear 1125",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200",
    cupo: 400,
    tags: ["concierto-sinfonico", "anime", "orquesta"],
  },
  {
    nombre: "Kuelgue en Buenos Aires",
    descripcion:
      "Show en vivo de la banda Kuelgue, con su mezcla característica de música, humor y energía escénica.",
    fecha: "2026-08-13T21:00:00.000-03:00",
    ubicacion: {
      nombre: "Movistar Arena",
      direccion: "Humboldt 450",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200",
    cupo: 500,
    tags: ["rock-nacional", "recital", "humor"],
  },
  {
    nombre: "Fatboy Slim en Buenos Aires",
    descripcion:
      "El ícono del big beat y la música electrónica se presenta en vivo en el Movistar Arena.",
    fecha: "2026-09-05T21:00:00.000-03:00",
    ubicacion: {
      nombre: "Movistar Arena",
      direccion: "Humboldt 450",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen:
      "https://images.unsplash.com/photo-1571266028243-d220c6a7edbf?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1571266028243-d220c6a7edbf?q=80&w=1200",
    cupo: 500,
    tags: ["electronica", "dj", "big-beat"],
  },
  {
    nombre: "Viva Frida",
    descripcion:
      "Muestra organizada junto al Museo Frida Kahlo y la Semana de Alta Costura, que explora el universo visual y estético de la artista mexicana.",
    fecha: "2026-09-18T15:00:00.000-03:00",
    ubicacion: {
      nombre: "Malba",
      direccion: "Av. Figueroa Alcorta 3415",
      ciudad: "CABA",
    },
    categoria: "moda",
    imagen:
      "https://malba.org.ar/wp-content/uploads/2025/05/03-Kahlo-Frida_Autorretrato-con-chango-y-loro_1942_Coleccion-Malba.jpg",
    imagenUrl:
      "https://malba.org.ar/wp-content/uploads/2025/05/03-Kahlo-Frida_Autorretrato-con-chango-y-loro_1942_Coleccion-Malba.jpg",
    cupo: 300,
    tags: ["frida-kahlo", "exposicion", "estilo"],
  },
  {
    nombre: "TecWeek Buenos Aires 2026",
    descripcion:
      "Semana de tecnologías emergentes y creativas con charlas, hackatones, demos y networking.",
    fecha: "2026-10-21T10:00:00.000-03:00",
    ubicacion: {
      nombre: "Centro Costa Salguero",
      direccion: "Av. Costanera Rafael Obligado y Salguero",
      ciudad: "CABA",
    },
    categoria: "tecnologia",
    imagen:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200",
    cupo: 1000,
    tags: ["tecnologia", "innovacion", "startups"],
  },
  {
    nombre: "Bienestar Fest",
    descripcion:
      "Festival de bienestar con clases de yoga, meditación, charlas sobre neurociencia y espacios de desconexión al aire libre.",
    fecha: "2026-10-24T11:00:00.000-03:00",
    ubicacion: {
      nombre: "Hipódromo de Palermo",
      direccion: "Av. del Libertador 4101",
      ciudad: "CABA",
    },
    categoria: "bienestar",
    imagen:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200",
    cupo: 4000,
    tags: ["yoga", "meditacion", "mindfulness"],
  },
  {
    nombre: "arteBA 2026",
    descripcion:
      "Feria de arte contemporáneo más importante de la región, con galerías nacionales e internacionales.",
    fecha: "2026-11-06T14:00:00.000-03:00",
    ubicacion: {
      nombre: "La Rural",
      direccion: "Av. Sarmiento 2704",
      ciudad: "CABA",
    },
    categoria: "arte",
    imagen:
      "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/arteba2024-1500x610.jpg",
    imagenUrl:
      "https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/arteba2024-1500x610.jpg",
    cupo: 1000,
    tags: ["feria-de-arte", "galerias", "coleccionismo"],
  },
  {
    nombre: "María Becerra presenta Quimera",
    descripcion:
      "María Becerra vuelve al Movistar Arena con su gira Quimera, en una de las residencias más esperadas del año.",
    fecha: "2026-11-13T21:00:00.000-03:00",
    ubicacion: {
      nombre: "Movistar Arena",
      direccion: "Humboldt 450",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200",
    cupo: 500,
    tags: ["pop-urbano", "recital", "gira"],
  },
  {
    nombre: "Primavera Sound Buenos Aires 2026",
    descripcion:
      "Regreso del festival internacional con una propuesta musical diversa, artistas internacionales y presencia de la escena argentina.",
    fecha: "2026-11-28T13:00:00.000-03:00",
    ubicacion: {
      nombre: "Parque Sarmiento",
      direccion: "Av. Dr. Ricardo Balbín 4750",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200",
    imagenUrl:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200",
    cupo: 20000,
    tags: ["festival", "indie", "internacional"],
  },
  {
    nombre: "RAVE3000 Festival 2026",
    descripcion:
      "Fiesta al aire libre de música electrónica y cultura alternativa, con line-up de artistas nacionales e internacionales, para mayores de 18 años.",
    fecha: "2026-12-12T22:00:00.000-03:00",
    ubicacion: {
      nombre: "Buenos Aires Nunca Duerme",
      direccion: "",
      ciudad: "CABA",
    },
    categoria: "musica",
    imagen: "https://www.passline.com/imagenes/eventos/-662368-rec.jpg",
    imagenUrl: "https://www.passline.com/imagenes/eventos/-662368-rec.jpg",
    cupo: 3000,
    tags: ["electronica", "rave", "+18"],
  },
];

async function api(method, path, body) {
  const url = `${API_BASE}${path}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error(`\n❌ Error en ${method} ${path}`);
    console.error("URL:", url);
    console.error("Status:", response.status);
    console.error("Body:", data);

    throw {
      method,
      path,
      status: response.status,
      body: data,
    };
  }

  return data;
}

async function cargarIntereses() {
  console.log("\n📌 Cargando intereses...");

  const result = await api("POST", "/intereses/bulk", {
    intereses,
  });

  console.log("✅ Intereses cargados correctamente");
  console.dir(result, { depth: null });

  return result;
}

async function cargarEventos() {
  console.log("\n📌 Cargando eventos...");

  const result = await api("POST", "/eventos/bulk", {
    eventos,
  });

  console.log("✅ Eventos cargados correctamente");
  console.dir(result, { depth: null });

  return result;
}

async function main() {
  console.log("🚀 Iniciando seed de eBA por API...");
  console.log("API_BASE:", API_BASE);

  const resumen = {
    interesesEnviados: intereses.length,
    eventosEnviados: eventos.length,
    interesesOk: false,
    eventosOk: false,
    errores: [],
  };

  try {
    await cargarIntereses();
    resumen.interesesOk = true;
  } catch (error) {
    resumen.errores.push({
      paso: "POST /api/intereses/bulk",
      error,
    });
  }

  try {
    await cargarEventos();
    resumen.eventosOk = true;
  } catch (error) {
    resumen.errores.push({
      paso: "POST /api/eventos/bulk",
      error,
    });
  }

  console.log("\n==============================");
  console.log("📊 RESUMEN FINAL");
  console.log("==============================");
  console.log("Intereses enviados:", resumen.interesesEnviados);
  console.log("Eventos enviados:", resumen.eventosEnviados);
  console.log("Intereses OK:", resumen.interesesOk ? "sí" : "no");
  console.log("Eventos OK:", resumen.eventosOk ? "sí" : "no");
  console.log("Errores:", resumen.errores.length);

  if (resumen.errores.length > 0) {
    console.log("\n❌ Detalle de errores:");
    console.dir(resumen.errores, { depth: null });
  }

  console.log("\n✅ Seed finalizado.");
}

main().catch((error) => {
  console.error("\n❌ Error general ejecutando seed:");
  console.dir(error, { depth: null });
});