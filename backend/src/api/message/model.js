import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ContentSchema = new Schema({
  text: {
    type: String,
    trim: true,
  },
  media: {
    type: String,
    trim: true,
  },
});

ContentSchema.path("text").validate(function (value) {
  return value || this.media; // text or media must be provided
}, "Either text or media or both is required");

ContentSchema.path("media").validate(function (value) {
  return value || this.text; // text or media must be provided
}, "Either text or media or both is required");

const messagesSchema = new Schema(
  {
    sender: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    content: {
      type: ContentSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Message", messagesSchema);
