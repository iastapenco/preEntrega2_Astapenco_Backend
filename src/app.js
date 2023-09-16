import "dotenv/config";
import express from "express";
import multer from "multer";
import productRouter from "./routes/products.routes.js";
import viewRouter from "./routes/view.routes.js";
import cartRouter from "./routes/carts.routes.js";
import userRouter from "./routes/users.routes.js";
import { engine } from "express-handlebars";
import { __dirname } from "./path.js";
import { Server } from "socket.io";
import path from "path";
import mongoose from "mongoose";
import { productModel } from "./dao/models/products.models.js";
import { messageModel } from "./dao/models/messages.models.js";
import { cartModel } from "./dao/models/carts.models.js";

const PORT = 8080;
const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("BDD conectada");
    // const resultados = await cartModel.findOne({
    //   _id: "65006527e2cd165279eac5df",
    // });
    // console.log(JSON.stringify(resultados));
  })
  .catch(() => console.log("Error en conexion a BDD"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/img");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const server = app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));
const upload = multer({ storage: storage });
app.use("/static", express.static(path.join(__dirname, "/public")));
const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`Servidor Socket.io del cliente conectado con id: ${socket.id}`);

  socket.on("mensaje", async (infoMensaje) => {
    await messageModel.create(infoMensaje);
    const listaMensajes = await messageModel.find().lean();
    socket.emit("mensajes", listaMensajes);
  });

  socket.on("nuevoProducto", async (data) => {
    const updatedProduct = await productModel.create(data);
    socket.emit("productoUpdated", updatedProduct);
    console.log(updatedProduct);
  });
});

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewRouter);
app.use("/api/users", userRouter);

app.post("/upload", upload.single("product"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  res.status(200).send("Imagen cargada");
});
