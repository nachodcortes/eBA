const express = require("express");
const mongoose = require("mongoose");
const Interes = require("../models/Interes");
const Usuario = require("../models/Usuario");

const router = express.Router();

const CONFIRMACION_RESET = "RESET_EBA_DB";

const INTERESES_INICIALES = [
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
];

const validarResetSecret = (req, res, next) => {
  const secretConfigurado = process.env.RESET_DB_SECRET;

  if (!secretConfigurado) {
    return res.status(503).json({
      error: "RESET_DB_SECRET no está configurado en el backend.",
    });
  }

  if (req.header("x-reset-secret") !== secretConfigurado) {
    return res.status(401).json({
      error: "Secret inválido para resetear la base.",
    });
  }

  return next();
};

const limpiarColecciones = async () => {
  const colecciones = await mongoose.connection.db.listCollections().toArray();
  const resultado = {};

  for (const coleccion of colecciones) {
    if (coleccion.name.startsWith("system.")) continue;

    const deleteResult = await mongoose.connection.db
      .collection(coleccion.name)
      .deleteMany({});

    resultado[coleccion.name] = deleteResult.deletedCount;
  }

  return resultado;
};

const crearManagerInicial = async (manager) => {
  if (!manager?.email || !manager?.contrasenia || !manager?.nombre) {
    return null;
  }

  const usuario = await Usuario.create({
    nombre: manager.nombre,
    nombreUsuario:
      manager.nombreUsuario ||
      manager.email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, ""),
    email: manager.email.toLowerCase().trim(),
    contrasenia: manager.contrasenia,
    edad: manager.edad || 21,
    intereses: manager.intereses || ["tecnologia", "networking"],
    emailVerificado: true,
    esManager: true,
    esOrganizador: true,
  });

  return {
    id: usuario._id,
    email: usuario.email,
    nombreUsuario: usuario.nombreUsuario,
    esManager: usuario.esManager,
    esOrganizador: usuario.esOrganizador,
  };
};

router.post("/reset-db", validarResetSecret, async (req, res) => {
  try {
    if (req.body?.confirmacion !== CONFIRMACION_RESET) {
      return res.status(400).json({
        error: `Para resetear la base mandá confirmacion: "${CONFIRMACION_RESET}".`,
      });
    }

    const coleccionesBorradas = await limpiarColecciones();
    let interesesCreados = 0;
    let managerCreado = null;

    if (req.body.seedIntereses !== false) {
      const intereses = await Interes.insertMany(INTERESES_INICIALES, {
        ordered: false,
      });
      interesesCreados = intereses.length;
    }

    if (req.body.manager) {
      managerCreado = await crearManagerInicial(req.body.manager);
    }

    return res.json({
      message: "Base reseteada correctamente.",
      coleccionesBorradas,
      interesesCreados,
      managerCreado,
    });
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo resetear la base.",
      detalle: error.message,
    });
  }
});

module.exports = router;
