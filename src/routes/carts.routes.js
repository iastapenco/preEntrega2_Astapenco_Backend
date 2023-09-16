import { Router } from "express";
import { cartModel } from "../dao/models/carts.models.js";
import { productModel } from "../dao/models/products.models.js";

const cartRouter = Router();

//Método auxiliar para obtener todos los carritos de la colección
cartRouter.get("/", async (req, res) => {
  try {
    const listCarts = await cartModel.find();
    res.status(200).send({ respuesta: "OK", mensaje: listCarts });
  } catch (error) {
    res.status(500).send({ respuesta: "Error", mensaje: error });
  }
});

//Método para obtener un carrito específico, dado su id
cartRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await cartModel.findOne({ _id: id }).lean();
    if (cart) res.render("cart", { cart });
    else
      res.status(404).send({
        respuesta: "Error en consultar Carrito",
        mensaje: "Not Found",
      });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en consulta carrito", mensaje: error });
  }
});

//Método para crear un carrito en la colección
cartRouter.post("/", async (req, res) => {
  try {
    const cart = await cartModel.create({});
    res.status(200).send({ respuesta: "OK", mensaje: cart });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en crear Carrito", mensaje: error });
  }
});

//Método para agregar un producto al carrito, dados sus respectivos ids
cartRouter.post("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findById(cid);
    if (cart) {
      const prod = await productModel.findById(pid);

      if (prod) {
        const indice = cart.products.findIndex((item) => item.id_prod == pid);
        if (indice != -1) {
          cart.products[indice].quantity = quantity;
        } else {
          cart.products.push({ id_prod: pid, quantity: quantity });
        }
        await cart.save();
        const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
        res.status(200).send({ respuesta: "OK", mensaje: respuesta });
      } else {
        res.status(404).send({
          respuesta: "Error en agregar producto Carrito",
          mensaje: "Produt Not Found",
        });
      }
    } else {
      res.status(404).send({
        respuesta: "Error en agregar producto Carrito",
        mensaje: "Cart Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ respuesta: "Error en agregar producto Carrito", mensaje: error });
  }
});

//Método para actualizar el carrito según un producto
cartRouter.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ message: "No se encontró el carrito" });
    }

    const productIndex = cart.products.findIndex((prod) =>
      prod.id_prod.equals(pid)
    );
    if (productIndex === -1) {
      return res.status(404).send({ message: "No se encontró el producto" });
    }
    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.status(200).send({ message: "Carrito actualizado", respuesta: cart });
  } catch (error) {
    res.status(500).send({ message: "Hubo un error al procesar tu solicitud" });
    console.log(error);
  }
});

//Método para eliminar un producto del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await cartModel.findOneAndUpdate(
      { _id: cid },
      { $pull: { products: { id_prod: pid } } },
      { new: true }
    );
    if (!cart) {
      return res.status(404).send({ message: "No se encontró el carrito" });
    }
    res.status(200).send({ message: "Producto eliminado", respuesta: cart });
  } catch (error) {
    res.status(500).send({
      message: "Hubo un error al procesar tu solicitud",
      error: error,
    });
  }
});

//Método para vacíar el carrito
cartRouter.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ message: "No se encontró el carrito" });
    }
    cart.products = [];
    await cart.save();
    res
      .status(200)
      .send({ message: "El carrito está vacío", respuesta: cart.products });
  } catch (error) {
    res.status(500).send({
      message: "Hubo un error al procesar tu solicitud",
      error: error,
    });
  }
});

//Método para actualizar un carrito, devolviendo los documentos y la paginación correspondiente
cartRouter.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const options = {
      page: 1,
      limit: 10,
    };

    const cart = await cartModel.paginate({ _id: cid }, options);

    if (!cart) {
      return res
        .status(404)
        .send({ message: "error", respuesta: "Carrito no encontrado" });
    }

    const resultados = {
      status: "success",
      payload: cart.docs,
      totalPages: cart.totalPages,
      prevPage: cart.prevPage,
      nextPage: cart.nextPage,
      page: cart.page,
      hasPrevPage: cart.hasPrevPage,
      hasNextPage: cart.hasNextPage,
      prevLink: cart.hasPrevPage ? `/carts?page=${cart.prevPage}` : null,
      nextLink: cart.hasNextPage ? `/carts?page=${cart.nextPage}` : null,
    };

    res
      .status(200)
      .send({ message: "Carrito actualizado", respuesta: resultados });
  } catch (error) {
    res.status(500).send({ message: "error", respuesta: error });
  }
});

export default cartRouter;
