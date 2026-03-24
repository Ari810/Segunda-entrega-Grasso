import { Router } from "express";
import { productModel } from "../models/products.model.js";

const router = Router();

// Get para obtener productos con paginacion, ordenamiento y filtrado
router.get("/", async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
        filter = {
            $or: [
                {category: query},
                {status: query === "true"},
            ]
        };
    }

    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        lean: true
    }


    const result = await productModel.paginate(filter, { 
        limit: parseInt(limit), 
        page: parseInt(page),
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        lean: true 
    });

    const baseUrl = "/api/products";

    const prevLink = result.hasPrevPage 
        ? `${baseUrl}?page=${result.prevPage}&limit=${limit}&sort=${sort || ""}&query=${query || ""}` 
        : null;

    const nextLink = result.hasNextPage 
        ? `${baseUrl}?page=${result.nextPage}&limit=${limit}&sort=${sort || ""}&query=${query || ""}` 
        : null;

    res.status(200).json({
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink,
        nextLink
    });
});

// Este get nos permitira obtener un producto por su id
router.get("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await productModel.findById(pid);
    if(!product) return res.status(404).json({mensaje: "Producto no encontrado"})
    res.json(product)
})

// Endpoint para agregar productos
router.post("/", async (req, res) =>{
    const data = req.body;
    const result = await productModel.create(data);
    const products = await productModel.find();
    req.io.emit("listaProductos", products);

    res.status(201).json(result);
})

// Endpoint para actualizar productos
router.put("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const dataUpdate = req.body;
    const updatedProduct = await productModel.findByIdAndUpdate(pid, dataUpdate, { new: true });
    if(!updatedProduct) return res.status(404).json({mensaje: "Producto no encontrado"})
    const products = await productModel.find();
    req.io.emit("listaProductos", products);

    res.json(updatedProduct);
})

// Endpoint para eliminar productos
router.delete("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const deletedProduct = await productModel.findByIdAndDelete(pid);
    if(!deletedProduct) return res.status(404).json({mensaje: "Producto no encontrado"});
    const products = await productModel.find();
    req.io.emit("listaProductos", products);

    res.json({mensaje: "Producto eliminado"})
})