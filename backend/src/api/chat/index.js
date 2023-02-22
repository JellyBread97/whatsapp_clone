import express from "express";
import ChatModel from "./model.js";
import UsersModel from "../user/model.js";
import { JWTAuthMiddleware } from "../../lib/auth/JWTauth.js";
import createHttpError from "http-errors";

const chatRouter = express.Router();

chatRouter.post("/newChat", JWTAuthMiddleware, async (req, res, next) => {
  try {
    if (req.body.receiver) {
      const chatsArray = await ChatModel.find({
        members: {
          $eq: [req.user._id, ...req.body.receiver],
        },
      });

      if (chatsArray.length !== 0) {
        res.status(201).send({ message: "CHAT EXIST ALREADY", theChat: chatsArray });
      } else {
        const newChat = new ChatModel({ members: [req.user._id, req.body.receiver] });
        const { _id } = await newChat.save();
        const updateSender = await UsersModel.findByIdAndUpdate(req.user._id, { $push: { chats: { _id } } }, { new: true });
        const updateReceiver = await UsersModel.findByIdAndUpdate(req.body.receiver, { $push: { chats: { _id } } }, { new: true });
        res.status(201).send({ newChat, updateSender, updateReceiver });
      }
    } else {
      next(createHttpError(400, "Receipient ID not provided"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

chatRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chats = await ChatModel.find({
      members: {
        $in: [req.user._id],
      },
    })
      .populate({ path: "messages", select: ["content"] })
      .populate({ path: "members", select: ["name", "email", "avatar"] });

    console.log(req.user._id);
    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
});
chatRouter.get("/:chatID", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chats = await ChatModel.find({
      members: {
        $in: [req.user._id],
      },
    })
      .populate({ path: "members", select: ["name", "email", "avatar"] })
      .populate({ path: "messages", select: ["content"] });

    if (chats) {
      chats.map((chat) => {
        chat.__v === req.params.chatID;
        console.log(req.user._id);
        res.status(200).send(chat.messages);
      });
    }
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
