import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [{ type: Schema.Types.ObjectId, ref: "Message", required: false }],
  },
  {
    timestamps: true,
  }
);

export default model("Chat", chatsSchema);
