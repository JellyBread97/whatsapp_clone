import jwt from "jsonwebtoken";
let onlineUsers = [];

export const newConnectionHandler = (newClient) => {
  // console.log("NEW CLIENT:", newClient);
  console.log("NEW CONNECTION:", newClient.id);

  // 1. Emit a "welcome" event to the connected client
  newClient.emit("welcome", { message: `Hello ${newClient.id}` });

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
  newClient.on("sendMessage", (message) => {
    console.log("NEW MESSAGE:", message);
    // 3.1 Whenever we receive that new message we have to propagate that message to everybody but not sender
    newClient.broadcast.emit("newMessage", message);
  });

  // 4. Listen to an event called "disconnect", this is NOT a custom event!! This event happens when an user closes browser/tab
  newClient.on("disconnect", () => {
    // 4.1 Server shall update the list of onlineUsers by removing the one that has disconnected
    // onlineUsers = onlineUsers.filter((user) => user.socketId !== newClient.id);
    // 4.2 Let's communicate the updated list all the remaining clients
    // newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
    const { token } = newClient.handshake.auth;
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    // Remove the online user from the shared array
    onlineUsers = onlineUsers.filter((user) => user.userId !== userId);

    // Broadcast the updated list to all other clients
    newClient.broadcast.emit("updateOnlineUsersList", onlineUsers);
  });
};
