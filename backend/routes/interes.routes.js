const express = require("express");
const Interes = require("../models/Interes");

const router = express.Router();

// GET /api/intereses
router.get("/", async (req, res) => {
  try {
    const intereses = await Interes.find().sort({ nombre: 1 });

    return res.json({
      message: "Intereses obtenidos correctamente",
      intereses,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener intereses",
      detalle: error.message,
    });
  }
});

// POST /api/intereses
router.post("/", async (req, res) => {
  try {
    const { nombre, slug, icono } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({
        error: "nombre y slug son obligatorios",
      });
    }

    const interes = await Interes.findOneAndUpdate(
      { slug },
      { nombre, slug, icono },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "Interés guardado correctamente",
      interes,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al guardar interés",
      detalle: error.message,
    });
  }
});

// POST /api/intereses/bulk
router.post("/bulk", async (req, res) => {
  try {
    const intereses = Array.isArray(req.body?.intereses)
      ? req.body.intereses
      : req.body;

    if (!Array.isArray(intereses) || intereses.length === 0) {
      return res.status(400).json({
        error: "Mandá un array de intereses o { intereses: [...] }",
      });
    }

    const resultado = {
      creados: [],
      actualizados: [],
      errores: [],
    };

    for (const item of intereses) {
      try {
        if (!item.nombre || !item.slug) {
          resultado.errores.push({
            item,
            error: "nombre y slug son obligatorios",
          });
          continue;
        }

        const existente = await Interes.findOne({ slug: item.slug });
        const interes = await Interes.findOneAndUpdate(
          { slug: item.slug },
          {
            nombre: item.nombre,
            slug: item.slug,
            icono: item.icono,
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );

        if (existente) {
          resultado.actualizados.push(interes);
        } else {
          resultado.creados.push(interes);
        }
      } catch (error) {
        resultado.errores.push({
          item,
          error: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "Carga masiva de intereses finalizada",
      ...resultado,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error en carga masiva de intereses",
      detalle: error.message,
    });
  }
});

module.exports = router;
