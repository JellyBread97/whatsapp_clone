import express from "express";
import MessageModel from "./model.js";

const messageRouter = express.Router();

messageRouter.post("/", async (req, res, next) => {
  try {
    const newMessage = new MessageModel(req.body);
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    next(error);
  }
});

export default messageRouter;
