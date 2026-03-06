// Importo las dependencias necesarias (express, el manager de los productos y el de los carritos)
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";         
import http from "http";
import { ProductManager } from "./productManager.js";
import { CartManager } from "./cartsManager.js";
// creo la aplicacion de express
const app = express();

const server = http.createServer(app);

const io = new Server(server);

// Middleware para trabajar con datos JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"))

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

const productManager = new ProductManager("./products.json");
const cartManager = new CartManager("./carts.json");


app.get("/", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("home", { products }); 
});

app.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts");
});

// Manejo de productos

// Este primer get nos permitira obtener todos los productos
app.get("/api/products", async (req, res) => {
    const products = await productManager.getProducts();
    res.json(products)
})

// Este get nos permitira obtener un producto por su id
app.get("/api/products/:pid", async (req, res) => {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductsById(pid);
    if(!product) return res.status(404).json({mensaje: "Producto no encontrado"})
    res.json(product)
})

// Endpoint para agregar productos
app.post("/api/products", async (req, res) =>{
    const data = req.body;
    const result = await productManager.addProducts(data);
    const products = await productManager.getProducts();
    io.emit("listaProductos", products);

    res.status(201).json(result);
})

// Endpoint para actualizar productos
app.put("/api/products/:pid", async (req, res) => {
    const pid = parseInt(req.params.pid);
    const dataUpdate = req.body;
    const updatedProduct = await productManager.updateProducts(pid, dataUpdate);
    if(!updatedProduct) return res.status(404).json({mensaje: "Producto no encontrado"})
    res.json(updatedProduct)
})

// Endpoint para eliminar productos
app.delete("/api/products/:pid", async (req, res) => {
    const pid = parseInt(req.params.pid);
    const deletedProduct = await productManager.deleteProducts(pid);
    if(!deletedProduct) return res.status(404).json({mensaje: "Producto no encontrado"});
    const products = await productManager.getProducts();
    io.emit("listaProductos", products);

    res.json({mensaje: "Producto eliminado"})
})

// Manejo de carritos

// Este get nos permitira obtener todos los carritos
app.get("/api/carts", async (req, res) => {
    const carts = await cartManager.getCarts();
    res.json(carts)
})

// Endpoint para crear un carrito
app.post("/api/carts", async (req, res) =>{
    const data = req.body;
    const result = await cartManager.createCart(data);
    res.status(201).json(result);
})

// Este get nos permitira obtener un carrito por su id
app.get("/api/carts/:cid", async (req, res) => {
    const cid = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cid);
    if(!cart) return res.status(404).json({mensaje: "Carrito no encontrado"})
    res.json(cart)
})

app.post("/api/carts/:cid/product/:pid", async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) return res.status(404).json({ mensaje: "Carrito no encontrado" });
    
    res.json(updatedCart);
});


io.on("connection", async (socket) => {
    console.log("Un cliente se ha conectado");

    const products = await productManager.getProducts();
    socket.emit("listaProductos", products);
});

// listen del servidor
server.listen(8080, () => {
    console.log("Servidor corriendo en el puerto 8080")
})

