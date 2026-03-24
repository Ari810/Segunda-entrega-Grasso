// Importo las dependencias necesarias (express, el manager de los productos y el de los carritos)
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";         
import http from "http";
import mongoose from "mongoose";
import productsRouter from "./routes/product.router.js";
import { productModel } from "./models/productModel.js";
import cartsRouter from "./routes/cart.routes.js";
import { cartModel } from "./models/cartModel.js";
import viewsRouter from "./routes/views.router.js";
// creo la aplicacion de express
const app = express();

const server = http.createServer(app);

const io = new Server(server);

// conecto con MongoDB
mongoose.connect("mongodb+srv://Tatosaurio:xuqzfelzZXGy1uXo@aribackend.7rzh3gb.mongodb.net/?appName=AriBackend")
    .then(() => console.log("Conectado a MongoDB"))
    .catch((error) => console.error("Error al conectar a MongoDB:", error));

// Middleware para trabajar con datos JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"))
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado");
    const products = await productModel.find().lean();
    socket.emit("listaProductos", products);
});

// listen del servidor
server.listen(8080, () => {
    console.log("Servidor corriendo en el puerto 8080")
})

