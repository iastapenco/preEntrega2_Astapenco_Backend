import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: String,
  lastname: String,
  age: Number,
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

export const userModel = model("users", userSchema);
