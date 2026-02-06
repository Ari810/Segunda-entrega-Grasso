// Importo libreria fs para manejar el sistema de archivos
import fs from "fs/promises"

// Creo y exporto la clase ProductManager
export class ProductManager {
    constructor (path) {
        this.path = path;
    }

    // Metodo para obtener los productos
    async getProducts(){
        try {
            const data = await fs.readFile(this.path, "utf-8")
            return (JSON.parse(data))
        } catch(error) {
            return [];
        }
    }

    // Metodo para obtener productos por id
    async getProductsById(id){
        const products = await this.getProducts();
        const productById = products.find(p => p.id === parseInt(id))
        return productById;
    }

    // Metodo para agregar productos
    async addProducts(productData){
        const products = await this.getProducts();
        const newProduct = { id: products.length + 1, ...productData };
        products.push(newProduct)

        await fs.writeFile(this.path, JSON.stringify(products, null, 2))
        
        return newProduct;
    }

    // Metodo para actualizar productos
    async updateProducts(id, dataUpdate) {  
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === parseInt(id));

        if (index === -1) return null;

        products[index] = { ...products[index], ...dataUpdate, id: parseInt(id) };

        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        return products[index];
    }

    // Metodo para eliminar productos
    async deleteProducts(id){
        const products = await this.getProducts();
        const filterProducts = products.filter(p => p.id !== parseInt(id));
        if (products.length === filterProducts.length) return false;

        await fs.writeFile(this.path, JSON.stringify(filterProducts, null, 2));
        return true;
    }
}