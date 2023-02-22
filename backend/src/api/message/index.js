import express from "express";
import { JWTAuthMiddleware } from "../../lib/auth/JWTauth.js";
import MessageModel from "./model.js";
import ChatModel from "../chat/model.js";

const messageRouter = express.Router();

messageRouter.post("/:chatId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const theChat = await ChatModel.findById(req.params.chatId);

    if (theChat) {
      const newMessage = new MessageModel({ sender: req.user._id, content: req.body });
      const { _id } = await newMessage.save();
      const updatedChat = await ChatModel.findByIdAndUpdate(req.params.chatId, { $push: { messages: { _id } } }, { new: true });
      await updatedChat.save();
      res.status(201).send({ updatedChat, newMessage });
    }
  } catch (error) {
    next(error);
  }
});

export default messageRouter;
