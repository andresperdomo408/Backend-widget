const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const cors = require("cors"); // Importa el middleware CORS
const atob = require("atob");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

// Respuestas para el asesor de ventas
const respuestasVentas = [
  "¡Claro, estaré encantado de ayudarte!",
  "¿En qué puedo ayudarte hoy?",
  "Tenemos una gran oferta que podría interesarte.",
  "Nuestros productos son de la mejor calidad.",
  "¿Tienes alguna pregunta específica en mente?",
  "Podemos ofrecerte financiamiento atractivo.",
  "Tenemos una amplia variedad de productos para elegir.",
  "Nuestro equipo de ventas está a tu disposición.",
  "Te garantizamos satisfacción total con tu compra.",
  "Nuestro servicio al cliente es incomparable.",
  "Hacemos entregas rápidas y seguras.",
  "¡Estamos aquí para hacerte la vida más fácil!",
  "Ofrecemos descuentos exclusivos para clientes habituales.",
  "¿Te gustaría saber más sobre nuestras promociones?",
  "Tenemos opciones de pago flexibles para ti.",
  "Siempre buscamos la mejor solución para nuestros clientes.",
  "Nuestros productos son respetuosos con el medio ambiente.",
  "Ofrecemos garantía de por vida en nuestros productos.",
  "Nuestra empresa tiene una sólida reputación en el mercado.",
  "Nos enorgullecemos de brindar un excelente servicio.",
];

// Respuestas especiales
const respuestasEspeciales = [
  { palabrasClave: ["precio", "costo"], respuesta: "Nuestros precios son muy competitivos." },
  { palabrasClave: ["descuento", "oferta"], respuesta: "Tenemos descuentos especiales esta semana." },
  { palabrasClave: ["envío"], respuesta: "Ofrecemos envío gratuito en compras superiores a $50." },
  { palabrasClave: ["garantía"], respuesta: "Nuestra garantía cubre cualquier defecto de fabricación." },
  { palabrasClave: ["tiempo de entrega"], respuesta: "El tiempo de entrega estándar es de 3-5 días hábiles." },
  { palabrasClave: ["financiamiento"], respuesta: "Ofrecemos planes de financiamiento a 12 meses sin intereses." },
  { palabrasClave: ["productos disponibles"], respuesta: "Tenemos una amplia gama de productos en stock." },
  {
    palabrasClave: ["atención al cliente"],
    respuesta: "Nuestro equipo de atención al cliente está disponible las 24 horas.",
  },
  {
    palabrasClave: ["servicio posventa"],
    respuesta: "Ofrecemos un servicio posventa excepcional para nuestros clientes.",
  },
  { palabrasClave: ["medio ambiente"], respuesta: "Nuestros productos están diseñados pensando en la sostenibilidad." },
  // Agrega más respuestas especiales aquí
];

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Función para seleccionar una respuesta de ventas en base al mensaje del cliente
function seleccionarRespuestaVenta(mensajeCliente) {
  mensajeCliente = mensajeCliente.toLowerCase();

  // Verificar respuestas especiales
  for (const respuestaEspecial of respuestasEspeciales) {
    for (const palabraClave of respuestaEspecial.palabrasClave) {
      if (mensajeCliente.includes(palabraClave)) {
        return respuestaEspecial.respuesta;
      }
    }
  }

  // Si no se encuentra una respuesta especial, seleccionar una respuesta de ventas al azar
  return respuestasVentas[Math.floor(Math.random() * respuestasVentas.length)];
}

// Configurar una conexión de Socket.io
io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Manejar eventos personalizados
  socket.on("chat-message", (message) => {
    console.log(`Mensaje recibido del cliente: ${message}`);
    const respuestaVentas = seleccionarRespuestaVenta(message);
    io.to(socket.id).emit("chat-message-response", respuestaVentas); // Enviar la respuesta al cliente
  });

  socket.on("image-upload", (base64Data) => {
    try {
      // Decodifica el archivo base64
      const decodedData = atob(base64Data.split(",")[1]);

      // Guarda el archivo en el servidor (por ejemplo, como un archivo .txt)
      fs.writeFileSync("archivo_recibido.txt", decodedData);

      // Envía una respuesta al cliente
      io.to(socket.id).emit("image-upload-response", "Imagen cargada exitosamente.");
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      io.to(socket.id).emit("image-response", "Error al cargar el archivo.");
    }
  });

  socket.on("file-upload", (base64Data) => {
    try {
      // Decodifica el archivo base64
      const decodedData = atob(base64Data.split(",")[1]);

      // Guarda el archivo en el servidor (por ejemplo, como un archivo .txt)
      fs.writeFileSync("archivo_recibido.txt", decodedData);

      // Envía una respuesta al cliente
      io.to(socket.id).emit("file-upload-response", "Archivo cargado exitosamente.");
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      io.to(socket.id).emit("file-upload-response", "Error al cargar el archivo.");
    }
  });

  // Manejar desconexiones
  socket.on("disconnect", () => {
    console.log("Un usuario se ha desconectado");
  });
});

// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
  console.log("Servidor en funcionamiento en el puerto 3000");
});
