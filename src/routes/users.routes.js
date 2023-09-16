import { Router } from "express";
import { userModel } from "../dao/models/users.models.js";

const userRouter = Router();

userRouter.get("/", async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({ response: "Ok", mensaje: users });
  } catch (error) {
    res.status(400).send({ response: "Error", mensaje: error });
  }
});

userRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (user) res.status(200).send({ response: "Ok", mensaje: user });
    else res.status(404).send({ response: "Error", mensaje: "User not found" });
  } catch (error) {
    res.status(400).send({ response: "Error", mensaje: error });
  }
});

userRouter.post("/", async (req, res) => {
  const { name, lastname, age, email, password } = req.body;
  try {
    const respuesta = await userModel.create({
      name,
      lastname,
      age,
      email,
      password,
    });
    res.status(200).send({ response: "Ok", mensaje: respuesta });
  } catch (error) {
    res.status(400).send({ response: "Error", mensaje: error });
  }
});

userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, lastname, age, email, password } = req.body;
  try {
    const user = await userModel.findByIdAndUpdate(id, {
      name,
      lastname,
      age,
      email,
      password,
    });
    if (user)
      res.status(200).send({ response: "Usuario actualizado", mensaje: user });
    else
      res
        .status(404)
        .send({ response: "Error", mensaje: "Usuario no encontrado" });
  } catch (error) {
    res.status(400).send({ response: "Error", mensaje: error });
  }
});

userRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);
    if (user)
      res.status(200).send({ response: "Ok", mensaje: "Usuario eliminado" });
    else res.status(404).send({ response: "Error", mensaje: "User not found" });
  } catch (error) {
    res.status(400).send({ response: "Error", mensaje: error });
  }
});

export default userRouter;
