require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

<<<<<<< HEAD
const usuarioRoutes = require("./routes/usuario.routes");
const eventoRoutes = require("./routes/evento.routes");
const asistenciaRoutes = require("./routes/asistencia.routes");
const solicitudconexionRoutes = require("./routes/solicitudconexion.routes");
const conexionRoutes = require("./routes/conexion.routes");
const publicacionRoutes = require("./routes/publicacion.routes");
const comentarioRoutes = require("./routes/comentario.routes");
const chatRoutes = require("./routes/chat.routes");
const mensajeRoutes = require("./routes/mensaje.routes");
const favoritoRoutes = require("./routes/favorito.routes");
const reporteRoutes = require("./routes/reportes.routes");
const logActividadRoutes = require("./routes/logActividad.routes");
const planPromocionRoutes = require("./routes/planPromocion.routes");
const notificacionRoutes = require("./routes/notificacion.routes");
const pagoRoutes = require("./routes/pago.routes");
const promocionEventoRoutes = require("./routes/promocionEvento.routes");
const interesRoutes = require("./routes/interes.routes");
const passport = require("./utils/passport");
const bloqueoRoutes = require("./routes/bloqueo.routes");



=======
>>>>>>> da206e8e8b2a5d78689f4d630b121aa362885bee
const app = express();
const PORT = process.env.PORT || 3000;

/*
  Cargador seguro de rutas:
  Si una ruta rompe por un import, passport, modelo, etc.,
  no tira abajo todo el server. Lo muestra en logs y sigue.
*/
const cargarRuta = (nombre, path) => {
  try {
    const ruta = require(path);
    console.log(`Ruta cargada OK: ${nombre}`);
    return ruta;
  } catch (error) {
    console.error(`ERROR cargando ruta ${nombre}:`);
    console.error(error.message);
    console.error(error.stack);
    return null;
  }
};

const usuarioRoutes = cargarRuta("usuarios", "./routes/usuario.routes");
const eventoRoutes = cargarRuta("eventos", "./routes/evento.routes");
const asistenciaRoutes = cargarRuta("asistencias", "./routes/asistencia.routes");
const solicitudconexionRoutes = cargarRuta(
  "solicitudes-conexion",
  "./routes/solicitudconexion.routes"
);
const conexionRoutes = cargarRuta("conexiones", "./routes/conexion.routes");
const publicacionRoutes = cargarRuta(
  "publicaciones",
  "./routes/publicacion.routes"
);
const comentarioRoutes = cargarRuta("comentarios", "./routes/comentario.routes");
const chatRoutes = cargarRuta("chats", "./routes/chat.routes");
const mensajeRoutes = cargarRuta("mensajes", "./routes/mensaje.routes");
const favoritoRoutes = cargarRuta("favoritos", "./routes/favorito.routes");
const reporteRoutes = cargarRuta("reportes", "./routes/reportes.routes");
const logActividadRoutes = cargarRuta(
  "logs-actividad",
  "./routes/logActividad.routes"
);
const planPromocionRoutes = cargarRuta(
  "planes-promocion",
  "./routes/planPromocion.routes"
);
const notificacionRoutes = cargarRuta(
  "notificaciones",
  "./routes/notificacion.routes"
);
const pagoRoutes = cargarRuta("pagos", "./routes/pago.routes");
const promocionEventoRoutes = cargarRuta(
  "promociones-evento",
  "./routes/promocionEvento.routes"
);
const interesRoutes = cargarRuta("intereses", "./routes/interes.routes");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use((req, res, next) => {
  console.log("Request recibida:", req.method, req.url);
  next();
});

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI cargada:", process.env.MONGO_URI ? "Sí" : "No");
console.log("EMAIL_USER cargado:", process.env.EMAIL_USER ? "Sí" : "No");
console.log("EMAIL_PASS cargado:", process.env.EMAIL_PASS ? "Sí" : "No");

if (!process.env.MONGO_URI) {
  console.error("Falta MONGO_URI en variables de entorno");
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("MongoDB Atlas conectado correctamente");
      console.log("Base conectada:", mongoose.connection.name);
    })
    .catch((error) => {
      console.error("Error conectando a MongoDB:");
      console.error(error.message);
    });
}

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/favicon.png", (req, res) => {
  res.status(204).end();
});

app.get("/", (req, res) => {
  res.json({
    message: "API de eBA funcionando",
    status: "ok",
  });
});

app.get("/ping", (req, res) => {
  res.json({
    message: "pong",
  });
});

app.get("/test-mongo", (req, res) => {
  res.json({
    message: "Test de MongoDB",
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name,
  });
});

<<<<<<< HEAD
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/eventos", eventoRoutes);
app.use("/api/asistencias", asistenciaRoutes);
app.use("/api/solicitudes-conexion", solicitudconexionRoutes);
app.use("/api/conexiones", conexionRoutes);
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/mensajes", mensajeRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/favoritos", favoritoRoutes);
app.use("/api/logs-actividad", logActividadRoutes);
app.use("/api/planes-promocion", planPromocionRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/promociones-evento", promocionEventoRoutes);
app.use("/api/intereses", interesRoutes);
app.use("/api/bloqueos", bloqueoRoutes);
app.use(passport.initialize());

=======
if (usuarioRoutes) app.use("/api/usuarios", usuarioRoutes);
if (eventoRoutes) app.use("/api/eventos", eventoRoutes);
if (asistenciaRoutes) app.use("/api/asistencias", asistenciaRoutes);

if (solicitudconexionRoutes) {
  app.use("/api/solicitudes-conexion", solicitudconexionRoutes);
}

if (conexionRoutes) app.use("/api/conexiones", conexionRoutes);
if (publicacionRoutes) app.use("/api/publicaciones", publicacionRoutes);
if (comentarioRoutes) app.use("/api/comentarios", comentarioRoutes);
if (chatRoutes) app.use("/api/chats", chatRoutes);
if (mensajeRoutes) app.use("/api/mensajes", mensajeRoutes);
if (reporteRoutes) app.use("/api/reportes", reporteRoutes);
if (favoritoRoutes) app.use("/api/favoritos", favoritoRoutes);
if (logActividadRoutes) app.use("/api/logs-actividad", logActividadRoutes);
if (planPromocionRoutes) app.use("/api/planes-promocion", planPromocionRoutes);
if (notificacionRoutes) app.use("/api/notificaciones", notificacionRoutes);
if (pagoRoutes) app.use("/api/pagos", pagoRoutes);

if (promocionEventoRoutes) {
  app.use("/api/promociones-evento", promocionEventoRoutes);
}

if (interesRoutes) app.use("/api/intereses", interesRoutes);

app.use((err, req, res, next) => {
  console.error("Error interno del servidor:");
  console.error(err.message);
  console.error(err.stack);

  res.status(500).json({
    error: "Error interno del servidor",
    detalle: err.message,
  });
});
>>>>>>> da206e8e8b2a5d78689f4d630b121aa362885bee

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: req.originalUrl,
  });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Express escuchando en http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;