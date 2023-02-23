import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import { checkFilteredSchema, checkUserSchema, triggerBadRequest } from "./validator.js";
import { JWTAuthMiddleware } from "../../lib/auth/JWTAuth.js";
// import { createAccessToken } from "../../lib/tools/tools.js";
import {
  createTokens,
  verifyRefreshAndCreateNewTokens,
  verifyRefreshAndCreateNewTokensUpdate,
} from "../../lib/tools/tools.js";

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const usersRouter = express.Router();

// CLOUDINARY - avatar upload
const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "whatsapp/avatar",
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
}).single("avatar");

// REGISTER
usersRouter.post("/account", checkUserSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const body = req.body;
    const user = new UsersModel(body);

    const { accessToken, refreshToken } = await createTokens(user);
    const { _id, email, username, avatar } = await user.save();

    res.status(201).send({ _id, username, email, avatar, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

// LOGIN
usersRouter.post("/session", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const { accessToken, refreshToken } = await createTokens(user);

      res.status(200).send({ accessToken, refreshToken });
    } else {
      // next(createHttpError(401, "Credentials are not ok!"));
      res.status(401).send({ failure: `Credentials not ok` });
    }
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "An error occurred while logging in"));
  }
});

// POST - REFRESH TOKEN [passed in the req.body]
usersRouter.post("/refreshTokens", async (req, res, next) => {
  try {
    const { currentRefreshToken } = req.body;

    const { accessToken, refreshToken } = await verifyRefreshAndCreateNewTokens(currentRefreshToken);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

// POST - REFRESH TOKEN [using JWT]
usersRouter.post("/updated/refreshTokens", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { refreshToken, accessToken } = await verifyRefreshAndCreateNewTokensUpdate(req);
    res.send({ refreshToken, accessToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// DELETE - REFRESH TOKEN
usersRouter.delete("/session", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await UsersModel.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    user.refreshToken = "";
    await user.save();

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET - all users [FILTER possibility]
usersRouter.get("/", async (req, res, next) => {
  try {
    const query = {};

    if (req.query.username) {
      const usernameIncludes = req.query.username;
      query.username = { $regex: `${usernameIncludes}`, $options: "i" };
    }

    if (req.query.email) {
      const emailIncludes = req.query.email;
      query.email = { $regex: `${emailIncludes}`, $options: "i" };
    }

    const users = await UsersModel.find(query, { avatar: 1, username: 1, email: 1, chats: 1 });
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "An error occurred while logging in"));
  }
});

// GET - me
usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await UsersModel.findById(_id);

    if (user) {
      res.status(200).send({ user });
    } else {
      res.status(404).send({ notFound: `User not found` });
    }
  } catch (error) {
    // we check if the error is an instance of either jwt.JsonWebTokenError or jwt.TokenExpiredError using the instanceof operator
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw createHttpError(401, "Not logged in");
    }
    console.log(error);
    next(error);
  }
});

// PUT - me
usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const updatedUser = await UsersModel.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (updatedUser) {
      res.status(204).send({ updatedUser });
    } else {
      res.status(404).send({ notFound: "User not found" });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw createHttpError(401, "Not logged in");
    }

    console.log(error);
    next(error);
  }
});

// GET - specific user
usersRouter.get("/single/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("id: ", id);

    const user = await UsersModel.findById(id);
    console.log("user: ", user);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send(user);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).send({ error: "Invalid ID supplied" });
    }
    console.log(error);
    next(error);
  }
});

// POST - AVATAR
usersRouter.post(
  "/me/avatar",
  JWTAuthMiddleware,
  (req, res, next) => {
    console.log("req.headers: ", req.headers);
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return res.status(400).send({ error: "Invalid request" });
    }
    next();
  },
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const avatar = req.file.path;

      const { _id } = req.user;
      const user = await UsersModel.findById(_id);

      if (user) {
        user.avatar = avatar;
        await user.save();
        res.status(204).send("Avatar uploaded");
      } else {
        res.status(404).send({ notFound: "User not found" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default usersRouter;
