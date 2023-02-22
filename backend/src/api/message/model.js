import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ContentSchema = new Schema({
  text: {
    type: String,
    required: false,
  },
  media: {
    type: String,
    required: false,
  },
});

// ContentSchema.path("text").validate(function (text) {
//   console.log("VALUE", text);
//   return text || this.media;
//   console.log("VALUE", value); // text or media must be provided
// }, "Either text or media or both is required");

// ContentSchema.path("media").validate(function (media) {
//   console.log("VALUE", media);
//   return media || this.text; // text or media must be provided
// }, "Either text or media or both is required");

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
