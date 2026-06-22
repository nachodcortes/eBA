const express = require("express");
const router = express.Router();

const Notificacion = require("../models/Notificacion");
const SolicitudConexion = require("../models/SolicitudConexion");

const obtenerLimit = (req, defecto = 10, maximo = 50) => {
  const valor = Number(req.query.limit);
  if (!Number.isFinite(valor) || valor <= 0) return defecto;
  return Math.min(Math.floor(valor), maximo);
};

const limpiarSolicitudesObsoletas = async (usuarioId) => {
  const notificacionesSolicitud = await Notificacion.find({
    usuarioId,
    entidadTipo: "solicitud",
  })
    .select("_id entidadId")
    .lean();

  if (notificacionesSolicitud.length === 0) return;

  const solicitudesPendientes = await SolicitudConexion.find({
    estado: "pendiente",
    $or: [{ usuariosolicitante: usuarioId }, { usuarioreceptor: usuarioId }],
  })
    .select("_id")
    .lean();

  const idsPendientes = new Set(
    solicitudesPendientes.map((solicitud) => String(solicitud._id))
  );
  const idsObsoletas = notificacionesSolicitud
    .filter((notificacion) => !idsPendientes.has(String(notificacion.entidadId)))
    .map((notificacion) => notificacion._id);

  if (idsObsoletas.length > 0) {
    await Notificacion.deleteMany({ _id: { $in: idsObsoletas } });
  }
};

// Crear notificación
router.post("/", async (req, res) => {
  try {
    const { usuarioId, mensaje, tipo, entidadTipo, entidadId, actorId } = req.body;

    const notificacion = new Notificacion({
      usuarioId,
      mensaje,
      tipo,
      entidadTipo,
      entidadId,
      actorId,
    });

    await notificacion.save();

    res.status(201).json({
      message: "Notificación creada correctamente",
      notificacion,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear notificación",
      detalle: error.message,
    });
  }
});

// Obtener todas las notificaciones
router.get("/", async (req, res) => {
  try {
    const limit = obtenerLimit(req, 10, 50);
    const notificaciones = await Notificacion.find()
      .select("usuarioId mensaje tipo entidadTipo entidadId actorId leida createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      message: "Notificaciones obtenidas correctamente",
      notificaciones,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener notificaciones",
      detalle: error.message,
    });
  }
});

// Obtener resumen liviano de notificaciones de un usuario
router.get("/usuario/:usuarioId/resumen", async (req, res) => {
  try {
    await limpiarSolicitudesObsoletas(req.params.usuarioId);

    const noLeidas = await Notificacion.countDocuments({
      usuarioId: req.params.usuarioId,
      leida: false,
    });

    res.json({
      message: "Resumen de notificaciones obtenido correctamente",
      noLeidas,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener resumen de notificaciones",
      detalle: error.message,
    });
  }
});

// Obtener notificaciones de un usuario
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const limit = obtenerLimit(req, 10, 50);

    await limpiarSolicitudesObsoletas(req.params.usuarioId);

    const notificaciones = await Notificacion.find({
      usuarioId: req.params.usuarioId,
    })
      .select("mensaje tipo entidadTipo entidadId actorId leida createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      message: "Notificaciones obtenidas correctamente",
      notificaciones,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener notificaciones",
      detalle: error.message,
    });
  }
});

// Obtener una notificación por ID
router.get("/:id", async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id)
      .populate("usuarioId", "nombre email fotoPerfilMini")
      .populate("actorId", "nombre nombreUsuario fotoPerfilMini");

    if (!notificacion) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

    res.json({
      message: "Notificación obtenida correctamente",
      notificacion,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener notificación",
      detalle: error.message,
    });
  }
});

// Marcar como leída
router.put("/:id/leida", async (req, res) => {
  try {
    const notificacion = await Notificacion.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { returnDocument: "after" }
    );

    if (!notificacion) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

    res.json({
      message: "Notificación marcada como leída",
      notificacion,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar notificación",
      detalle: error.message,
    });
  }
});

// Eliminar notificación
router.delete("/:id", async (req, res) => {
  try {
    const notificacion = await Notificacion.findByIdAndDelete(
      req.params.id
    );

    if (!notificacion) {
      return res.status(404).json({
        error: "Notificación no encontrada",
      });
    }

    res.json({
      message: "Notificación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar notificación",
      detalle: error.message,
    });
  }
});

module.exports = router;
