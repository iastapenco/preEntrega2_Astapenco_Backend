import { Router } from "express";
import { productModel } from "../dao/models/products.models.js";

const productRouter = Router();

//Método para obtener todos los productos
productRouter.get("/", async (req, res) => {
  try {
    const { limit, page, sort, category } = req.query;

    const options = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sort: {
        price: Number(sort),
      },
    };

    if (!(options.sort.price === -1 || options.sort.price === 1)) {
      delete options.sort;
    }

    const prods = await productModel.paginate(
      {
        /*category: String(category)*/
      },
      options
    );
    console.log(prods);
    res.status(200).send({ respuesta: "OK", mensaje: prods });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en consultar productos", mensaje: error });
  }
});

//Método para obtener un producto específico por su id
productRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const prod = await productModel.findById(id);
    if (prod) res.status(200).send({ respuesta: "OK", mensaje: prod });
    else
      res.status(404).send({
        respuesta: "Error en consultar Producto",
        mensaje: "Not Found",
      });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en consulta producto", mensaje: error });
  }
});

//Método para crear un producto
productRouter.post("/", async (req, res) => {
  const { title, description, stock, code, price, category } = req.body;
  try {
    const prod = await productModel.create({
      title,
      description,
      stock,
      code,
      price,
      category,
    });
    res.status(200).send({ respuesta: "OK", mensaje: prod });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en crear productos", mensaje: error });
  }
});

//Método para actualizar un producto dado su id
productRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, stock, status, code, price, category } = req.body;

  try {
    const prod = await productModel.findByIdAndUpdate(id, {
      title,
      description,
      stock,
      status,
      code,
      price,
      category,
    });
    if (prod)
      res
        .status(200)
        .send({ respuesta: "OK", mensaje: "Producto actualizado" });
    else
      res.status(404).send({
        respuesta: "Error en actualizar Producto",
        mensaje: "Not Found",
      });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en actualizar producto", mensaje: error });
  }
});

//Método para borrar un producto de la colección, dado su id
productRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const prod = await productModel.findByIdAndDelete(id);
    if (prod)
      res.status(200).send({ respuesta: "OK", mensaje: "Producto eliminado" });
    else
      res.status(404).send({
        respuesta: "Error en eliminar Producto",
        mensaje: "Not Found",
      });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en eliminar producto", mensaje: error });
  }
});

export default productRouter;
