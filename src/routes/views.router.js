import { Router } from "express";
import { productModel } from "../models/productModel.js";
import { cartModel } from "../models/cartModel.js";

const router = Router();

router.get("/products", async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const products = await productModel.paginate({}, { page, limit, lean: true });
    res.render("products", {
        products: products.docs,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        prevPage: products.prevPage,
        nextPage: products.nextPage,
        currentPage: products.page
    });
});

router.get("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    const cart = await cartModel.findById(cid).lean();
    
    if (!cart) return res.status(404).send("Carrito no encontrado");

    res.render("cart", { products: cart.products });
});

router.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts");
});

router.get("/", async (req, res) => {
    const products = await productModel.find().lean();
    res.render("home", { products });
});

export default router;