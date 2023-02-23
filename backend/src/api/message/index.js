import express from "express";
import { JWTAuthMiddleware } from "../../lib/auth/JWTauth.js";
import MessageModel from "./model.js";
import ChatModel from "../chat/model.js";
import createHttpError from "http-errors";

const messageRouter = express.Router();

messageRouter.post("/:chatId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const theChat = await ChatModel.findById(req.params.chatId);

    if (theChat) {
      if (req.body.text || req.body.media) {
        const newMessage = new MessageModel({
          sender: req.user._id,
          content: { text: req.body.text, media: req.body.media },
        });
        const { _id } = await newMessage.save();
        const updatedChat = await ChatModel.findByIdAndUpdate(
          req.params.chatId,
          { $push: { messages: { _id } } },
          { new: true }
        );
        await updatedChat.save();
        res.status(201).send({ updatedChat, newMessage });
      } else {
        next(createHttpError(400, `Either text or media or both is required`));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default messageRouter;
