import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http"; // CORE MODULE
// import { newConnectionHandler } from "./socket/index.js";
import usersRouter from "./api/user/index.js";
import { notFoundHandler, badRequestHandler, genericErrorHandler } from "./errorhandlers.js";

const server = express();
const port = process.env.PORT || 3001;

// ******************************* MIDDLEWARES ****************************************
server.use(cors());
server.use(express.json());

// ******************************** ENDPOINTS *****************************************
server.use("/users", usersRouter);

// ***************************** ERROR HANDLERS ***************************************
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

const mongooseURL = process.env.MONGO_URL;

mongoose.connect(mongooseURL);
mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
