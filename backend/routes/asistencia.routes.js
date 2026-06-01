const express = require("express");
const router = express.Router();

const Asistencia = require("../models/Asistencia");

// Crear asistencia
router.post("/", async (req, res) => {
  try {
    const { usuarioId, eventoId, estado } = req.body;

    const asistencia = new Asistencia({
      usuarioId,
      eventoId,
      estado,
    });

    await asistencia.save();

    res.json({
      message: "Asistencia registrada correctamente",
      asistencia,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al registrar asistencia",
      detalle: error.message,
    });
  }
});

// Obtener todas
router.get("/", async (req, res) => {
  try {
    const asistencias = await Asistencia.find()
      .populate("usuarioId", "nombre email")
      .populate("eventoId", "nombre fecha categoria");

    res.json({
      message: "Asistencias obtenidas correctamente",
      asistencias,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener asistencias",
      detalle: error.message,
    });
  }
});

module.exports = router;