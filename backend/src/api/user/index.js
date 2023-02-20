import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import { checkUserSchema, triggerBadRequest } from "./validator.js";
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

export default usersRouter;
