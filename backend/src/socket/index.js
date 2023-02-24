import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../lib/tools/tools.js";
import UsersModel from "../api/user/model.js";
import MessagesModel from "../api/message/model.js";
import ChatsModel from "../api/chat/model.js";

let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  // console.log("NEW CLIENT:", newClient);
  console.log("NEW CONNECTION:", newClient.id);

  // newClient.on("connection", async (socket) => {
  //   const token = socket.handshake.auth.token;

  //   try {
  //     const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  //     const { _id, username } = decoded;
  //     console.log("_id & username:", _id, username);

  //     const user = {
  //       id: socket.id,
  //       _id,
  //       username,
  //     };

  //     onlineUsers.push(user);

  //     console.log(`User ${username} connected`);
  //   } catch (error) {
  //     console.log(error);
  //     socket.disconnect();
  //   }
  // });
  // newClient.on("connect", async () => {
  //   try {
  //     const accessToken = localStorage.getItem("accessToken");
  //     const { _id: userId } = await verifyAccessToken(accessToken);
  //     const user = await UsersModel.findById(userId).populate("chats");
  //     const chats = user.chats;
  //     chats.forEach((chat) => {
  //       socket.join(chat._id.toString());
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  // 1. Emit a "welcome" event to the connected client
  newClient.emit("connection", { message: `Hello ${newClient.id}` });

  // 2. Listen to an event emitted by the FE called "setUsername", this event is going to contain the username in the payload
  newClient.on("setUsername", (payload) => {
    console.log("payload", payload);

    const { token } = newClient.handshake.auth;
    // const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const username = payload.username;
    const userId = payload.userId;
    console.log("userId", userId);
    const onlineUser = { userId, username, socketId: newClient.id };
    onlineUsers.push(onlineUser);
    // onlineUsers.length = 0;
    console.log("onlineusers: ", onlineUsers);

    newClient.emit("loggedIn", onlineUsers);

    newClient.emit("updateOnlineUsersList", onlineUsers);
  });

  // 3. Listen to "sendMessage" event, this is received when an user sends a new message
  // newClient.on("sendMessage", (message) => {
  //   console.log("NEW MESSAGE:", message);
  //   // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
  //   newClient.broadcast.emit("newMessage", message);
  // });

  newClient.on("sendMessage", async (message) => {
    console.log("new message ", message);
    const { sender, receiver, text, createdAt } = message;
    const { _id } = await new MessagesModel({
      sender,
      receiver,
      text,
      createdAt,
    }).save();

    const commonChat = await ChatsModel.findOne({ members: { $in: [sender, receiver] } });
    const targetSocket = onlineUsers.find((user) => user._id === receiver);
    if (commonChat) {
      await commonChat.update({ $push: { messages: { _id } } });

      if (targetSocket) {
        targetSocket.emit("joinRoom", { chatId: commonChat._id });
        // Emit a message to the chat room
        console.log(`Joining room ${commonChat._id}`);
        targetSocket.to(chatId).emit("chatMessage", message);

        targetSocket.emit("newMessage", message);
      }
    } else {
      const newCommonChat = await new ChatsModel({ members: [sender, receiver], messages: [_id] }).save();
      if (targetSocket) {
        targetSocket.emit("joinRoom", { chatId: commonChat._id });
        console.log(`Joining room ${commonChat._id}`); // add console.log here
        targetSocket.to(chatId).emit("chatMessage", message);
        targetSocket.emit("newMessage", message);
      }
    }
  });

  // 4. Listen to an event called "disconnect", this is NOT a custom event!! This event happens when an user closes browser/tab
  newClient.on("disconnect", () => {
    // 4.1 Server shall update the list of onlineUsers by removing the one that has disconnected
    onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    // 4.2 Let's communicate the updated list all the remaining clients
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
    // const { token } = newClient.handshake.auth;
    // const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    // Remove the online user from the shared array
    // onlineUsers = onlineUsers.filter((user) => user.userId !== userId);

    // Broadcast the updated list to all other clients
    // newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
