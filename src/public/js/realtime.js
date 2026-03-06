const socket = io();

socket.on("listaProductos", (products) => {
    console.log("Recibiendo productos...", products);
    const lista = document.getElementById("lista-productos");
    if (lista) {
        lista.innerHTML = "";
        products.forEach(prod => {
            const li = document.createElement("li");
            li.innerText = `${prod.title} - $${prod.price}`;
            lista.appendChild(li);
        });
    }
});

function deleteProduct(id) {
    fetch(`/api/products/${id}`, { method: 'DELETE' });
}