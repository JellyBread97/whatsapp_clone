import express from "express";
import ChatModel from "./model.js";
import UsersModel from "../user/model.js";
import { JWTAuthMiddleware } from "../../lib/auth/JWTauth.js";

const chatRouter = express.Router();

chatRouter.post("/", async (req, res, next) => {
  try {
    const newChat = new ChatModel(req.body);
    await newChat.save();
    res.status(201).send(newChat);
  } catch (error) {
    next(error);
  }
});

chatRouter.post("/newChat", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chatsArray = await ChatModel.findOne({
      members: {
        $in: [req.body.receiver, req.user._id],
      },
    });
    console.log("CHATARRAY:", chatsArray);

    if (chatsArray.length !== 0) {
      console.log("CHAT ALREADY EXISTS");
    } else {
      const newChat = new ChatModel({ members: [req.user._id, req.body.receiver] });
      const { _id } = await newChat.save();
      const updateSender = await UsersModel.findByIdAndUpdate(req.user._id, { $push: { chats: { _id } } }, { new: true });
      const updateReceiver = await UsersModel.findByIdAndUpdate(req.body.receiver, { $push: { chats: { _id } } }, { new: true });
      res.status(201).send({ newChat, updateSender, updateReceiver });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

chatRouter.get("/", async (req, res, next) => {
  try {
    const chats = await ChatModel.find().populate({ path: "messages", select: ["content"] });
    // .populate({ path: "members", select: ["name", "email", "avatar"] });
    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
