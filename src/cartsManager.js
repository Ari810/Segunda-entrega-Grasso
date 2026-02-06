// Importo libreria fs para manejar el sistema de archivos
import fs from "fs/promises"

// Creo y exporto la clase CartManager
export class CartManager {
    constructor (path) {
        this.path = path;
    }

    // Metodo para obtener los carritos
    async getCarts(){
            try {
                const data = await fs.readFile(this.path, "utf-8")
                return (JSON.parse(data))
            } catch(error) {
                return [];
            }
        }

    // Metodo para crear un carrito
    async createCart(){
        const carts = await this.getCarts();
        const newCart = { id: carts.length + 1, products: [] };
        carts.push(newCart)
        
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2))
                
        return newCart;
    }

    // Metodo para obtener carritos por id
    async getCartById(id){
        const carts = await this.getCarts();
        const cartsById = carts.find(c => c.id === parseInt(id))
        return cartsById;
    }

}