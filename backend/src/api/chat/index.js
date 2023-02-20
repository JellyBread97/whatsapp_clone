import express from "express";
import ChatModel from "./model.js";

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

chatRouter.get("/", async (req, res, next) => {
  try {
    const chats = await ChatModel.find()
      .populate({ path: "messages", select: ["content"] })
      .populate({ path: "members", select: ["name", "email", "avatar"] });
    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
