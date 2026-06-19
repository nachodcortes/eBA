const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Mensaje = require("../models/Mensaje");
const Evento = require("../models/Evento");

const unirseAChatEvento = async (req, res) => {
  try {
    const eventoId = req.params.eventoId || req.body.eventoId;
    const { usuarioId } = req.body;

    if (!eventoId) {
      return res.status(400).json({ error: "eventoId es obligatorio" });
    }

    if (!usuarioId) {
      return res.status(400).json({ error: "usuarioId es obligatorio" });
    }

    const evento = await Evento.findById(eventoId).select("nombre");

    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    let chat = await Chat.findOne({ tipo: "evento", eventoId });

    if (!chat) {
      chat = await Chat.create({
        tipo: "evento",
        eventoId,
        nombre: evento.nombre,
        participantes: [usuarioId],
      });
    } else if (!chat.participantes.some((id) => String(id) === String(usuarioId))) {
      chat.participantes.push(usuarioId);
      await chat.save();
    }

    const chatPopulado = await Chat.findById(chat._id)
      .populate("participantes", "nombre nombreUsuario email fotoPerfil")
      .populate("eventoId", "nombre fecha");

    return res.json({
      message: "Chat grupal del evento listo",
      chat: chatPopulado,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al unirse al chat del evento",
      detalle: error.message,
    });
  }
};

router.post("/", async (req, res) => {
  try {
    if (req.body.accion === "unirse-evento" || req.body.eventoId) {
      return unirseAChatEvento(req, res);
    }

    const { conexionId, participantes } = req.body;

    if (!Array.isArray(participantes) || participantes.length === 0) {
      return res.status(400).json({
        error: "participantes es obligatorio para crear un chat privado",
      });
    }

    // Verificar si ya existe un chat con los mismos participantes
    const chatExistente = await Chat.findOne({
      participantes: { $all: participantes, $size: participantes.length }
    });

    if (chatExistente) {
      return res.status(400).json({ error: "Ya existe un chat con estos participantes" });
    }

    // Crear nuevo chat
    const chat = new Chat({ conexionId, participantes });
    await chat.save();

    // 🔹 IMPORTANTE: usar return para cerrar la respuesta
    return res.status(201).json({ message: "Chat creado correctamente", chat });
  } catch (error) {
    return res.status(500).json({ error: "Error al crear chat", detalle: error.message });
  }
});

// Unirse o abrir chat grupal de un evento
router.post("/evento/:eventoId/unirse", unirseAChatEvento);

// Obtener chat grupal de un evento
router.get("/evento/:eventoId", async (req, res) => {
  try {
    const chat = await Chat.findOne({
      tipo: "evento",
      eventoId: req.params.eventoId,
    })
      .populate("participantes", "nombre nombreUsuario email fotoPerfil")
      .populate("eventoId", "nombre fecha");

    if (!chat) return res.status(404).json({ error: "Chat no encontrado" });

    return res.json({ message: "Chat obtenido correctamente", chat });
  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener chat del evento",
      detalle: error.message,
    });
  }
});

// Obtener todos los chats
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("participantes", "nombre nombreUsuario email fotoPerfil")
      .sort({ updatedAt: -1 });
    res.json({ message: "Chats obtenidos correctamente", chats });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener chats", detalle: error.message });
  }
});

// Obtener chats de un usuario
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const chats = await Chat.find({
      participantes: req.params.usuarioId,
      estado: "activo",
    })
      .populate("participantes", "nombre nombreUsuario email fotoPerfil")
      .populate("conexionId")
      .populate("eventoId", "nombre fecha")
      .sort({ updatedAt: -1 });

    res.json({ message: "Chats obtenidos correctamente", chats });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener chats", detalle: error.message });
  }
});

// Obtener chat existente entre dos usuarios
router.get("/entre/:usuario1Id/:usuario2Id", async (req, res) => {
  try {
    const { usuario1Id, usuario2Id } = req.params;

    const chat = await Chat.findOne({
      participantes: { $all: [usuario1Id, usuario2Id], $size: 2 },
    })
      .populate("participantes", "nombre nombreUsuario email fotoPerfil")
      .populate("conexionId");

    if (!chat) return res.status(404).json({ error: "Chat no encontrado" });

    res.json({ message: "Chat obtenido correctamente", chat });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener chat", detalle: error.message });
  }
});

// Obtener un chat por ID
router.get("/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participantes", "nombre nombreUsuario email fotoPerfil")
      .populate("conexionId");
    if (!chat) return res.status(404).json({ error: "Chat no encontrado" });
    res.json({ message: "Chat obtenido correctamente", chat });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener chat", detalle: error.message });
  }
});

// Eliminar un chat
router.delete("/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: "Chat no encontrado" });
    }

    //  Eliminar mensajes asociados al chat
    await Mensaje.deleteMany({ chatId: chat._id });

    //  Eliminar el chat
    await Chat.findByIdAndDelete(chat._id);

    res.json({ message: "Chat y mensajes eliminados correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar chat", detalle: error.message });
  }
});

module.exports = router;
