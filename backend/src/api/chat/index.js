import express from "express";
import ChatModel from "./model.js";
import UsersModel from "../user/model.js";

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

chatRouter.post("/:senderId/:receiverId", async (req, res, next) => {
  try {
    const sender = UsersModel.findById(req.params.senderId);
    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;

    const allChats = await ChatModel.find();

    let status = null;

    const checkChatExistance = async (sender, receiver) => {
      const filterd = allChats.map((chat) => {
        if (chat.members.includes(receiver) && chat.members.includes(sender) && chat.members.length === 3) {
          console.log("-------------:", true);
          console.log("ARRAY:LENGTH-1:", chat.members.length);
          status = chat;
          return chat;
        }
      });
    };

    const filter = await checkChatExistance(senderId, receiverId);
    console.log("--------------------------------", status);

    if (status) {
      console.log("POSITIVE");
    } else {
      console.log("NEGATIVE");
    }
  } catch (error) {
    next(error);
  }
});

chatRouter.get("/", async (req, res, next) => {
  try {
    const chats = await ChatModel.find();
    //   .populate({ path: "messages", select: ["content"] })
    //   .populate({ path: "members", select: ["name", "email", "avatar"] });
    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
