import { Schema, model } from "mongoose";

const messagesSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  postTime: {
    type: Date,
  },
});

export const messageModel = model("messages", messagesSchema);
