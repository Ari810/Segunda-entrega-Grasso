import { Router } from "express";
import { cartModel } from "../models/cartModel.js";

const router = Router();

// Este get nos permitira obtener todos los carritos
router.get("/", async (req, res) => {
    const carts = await cartModel.find().lean();
    res.json(carts);
});

// Endpoint para crear un carrito
router.post("/", async (req, res) => {
    const cart = await cartModel.create({ products: [] });
    res.status(201).json(cart);
});

// Este get nos permitira obtener un carrito por su id
router.get("/:cid", async (req, res) => {
    const { cid } = req.params;
    const cart = await cartModel.findById(cid);
    if (!cart) return res.status(404).json({ mensaje: "Carrito no encontrado" });
    res.json(cart);
});

// Este post nos permite agregar productos a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await cartModel.findById(cid);
    if (!cart) return res.status(404).json({ mensaje: "Carrito no encontrado" });

    const productExist = cart.products.find(p => p.product.toString() === pid);

    if (productExist) {
        productExist.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ mensaje: "Carrito actualizado", cart });
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await cartModel.findById(cid);
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    res.json({ status: "success", message: "Producto eliminado del carrito" });
});

// Actualizar el carrito
router.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    const cart = await cartModel.findByIdAndUpdate(cid, { products }, { new: true });
    res.json({ status: "success", cart });
});

// Actualizar solo la cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await cartModel.findById(cid);
    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity = quantity;
        await cart.save();
        res.json({ status: "success", message: "Cantidad actualizada" });
    } else {
        res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
    }
});

// Vaciar carrito
router.delete("/:cid", async (req, res) => {
    const { cid } = req.params;
    const cart = await cartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
    res.json({ status: "success", message: "Carrito vaciado", cart });
});

export default router;