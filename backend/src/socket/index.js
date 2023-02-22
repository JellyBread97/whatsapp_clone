// import uniqid from "uniqid";
import MessagesModel from "../api/message/model.js";
import { JWTAuthMiddleware } from "../lib/auth/JWTauth.js";

let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  console.log("NEW CONNECTION - id: ", newClient.id);

  newClient.emit("welcome", { message: `Hello ${newClient.id}` });
  newClient.on("setUsername", (payload) => {
    console.log(payload);
    onlineUsers.push({ username: payload.username, socketId: newClient.id });
    console.log("ONLINE USERS----", onlineUsers);

    newClient.emit("loggedIn", onlineUsers);

    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });

  newClient.on("sendMessage", async (message) => {
    console.log("NEW MESSAGE:", message);

    // // const newMessage = new MessagesModel(message.message);
    // const newMessage = new MessagesModel({ sender: "63f604c6153d28812f832dc2", content: { text: message.message.sender, media: "req.body.media" } });
    // console.log("newMessage: ", newMessage);
    // await newMessage.save();
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("newMessage", message);
  });
};
