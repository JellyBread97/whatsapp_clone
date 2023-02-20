import mongoose from "mongoose";
const { Schema, model } = mongoose;

const messagesSchema = new Schema(
  {
    sender: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    content: {
      text: { type: String, required: true },
      media: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", messagesSchema);
