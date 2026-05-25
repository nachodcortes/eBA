# eBA - Backend

Backend desarrollado para **eBA**, una aplicación de eventos pensada para que los usuarios puedan descubrir eventos, ver información detallada y conectarse con otras personas interesadas en asistir.

Este backend está hecho con **Node.js**, **Express** y **MongoDB Atlas** como base de datos.

---

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcryptjs
- dotenv

---

## Estructura del proyecto

```txt
backend/
├── models/
│   ├── Usuario.js
│   ├── Evento.js
│   └── Asistencia.js
│
├── routes/
│   ├── usuario.routes.js
│   ├── evento.routes.js
│   └── asistencia.routes.js
│
├── server.js
├── package.json
├── .env
└── README.md


MongoDB Atlas = donde están guardados los datos
Model = la forma/estructura que espera el backend
Routes = los endpoints para pedir o modificar datos