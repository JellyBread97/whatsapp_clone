import mongoose from "mongoose";

const { Schema, model } = mongoose;

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    password: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export default model("User", usersSchema);
