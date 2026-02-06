import fs from "fs/promises"

export class CartManager {
    constructor (path) {
        this.path = path;
    }

    async getCarts(){
            try {
                const data = await fs.readFile(this.path, "utf-8")
                return (JSON.parse(data))
            } catch(error) {
                return [];
            }
        }

    async createCart(){
        const carts = await this.getCarts();
        const newCart = { id: carts.length + 1, products: [] };
        carts.push(newCart)
        
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2))
                
        return newCart;
    }

    async getCartById(id){
        const carts = await this.getCarts();
        const cartsById = carts.find(c => c.id === parseInt(id))
        return cartsById;
    }

}