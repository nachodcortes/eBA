const express = require("express");

const Conexion = require("../models/Conexion");

const router = express.Router();

/*
GET /api/conexiones/usuario/:usuarioId
Obtener conexiones de un usuario
*/
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const conexiones = await Conexion.find({
      $or: [
        { usuario1: usuarioId },
        { usuario2: usuarioId },
      ],
    })
      .populate("usuario1")
      .populate("usuario2");

    res.json(conexiones);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener conexiones",
    });
  }
});

/*
GET /api/conexiones
 Obtener todas las conexiones esta es para testing se puede borrar sin drama
*/
router.get("/", async (req, res) => {
  try {
    const conexiones = await Conexion.find()
      .populate("usuario1")
      .populate("usuario2");

    res.json(conexiones);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener conexiones",
    });
  }
});

module.exports = router;