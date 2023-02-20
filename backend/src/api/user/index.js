import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import { checkFilteredSchema, checkUserSchema, triggerBadRequest } from "./validator.js";
import { JWTAuthMiddleware } from "../../lib/auth/JWTAuth.js";
import { createAccessToken } from "../../lib/tools/tools.js";

const usersRouter = express.Router();

// REGISTER
usersRouter.post("/account", checkUserSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const body = req.body;
    const user = new UsersModel(body);

    const payload = { _id: user._id, username: user.username };
    const accessToken = await createAccessToken(payload);
    const { _id, email } = await user.save();

    res.status(201).send({ _id, email, accessToken });
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
      const payload = { _id: user._id, username: user.username };
      const accessToken = await createAccessToken(payload);

      res.status(200).send({ accessToken });
    } else {
      // next(createHttpError(401, "Credentials are not ok!"));
      res.status(401).send({ failure: `Credentials not ok` });
    }
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "An error occurred while logging in"));
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

    const users = await UsersModel.find(query, { avatar: 1, username: 1, email: 1 });
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

export default usersRouter;
