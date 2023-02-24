import createHttpError from "http-errors";
import { verifyAccessToken } from "../tools/tools.js";
import UsersModel from "../../api/user/model.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please login first!"));
  } else {
    try {
      const accessToken = req.headers.authorization.replace("Bearer ", "");

      const payload = await verifyAccessToken(accessToken);

      req.user = {
        _id: payload._id,
        username: payload.username,
      };

      // attach the chats belonging to the authenticated user to the req object
      const user = await UsersModel.findById(payload._id).populate("chats");

      req.user.chats = user.chats;

      next();
    } catch (error) {
      console.log(error);

      next(createHttpError(401, "Token not valid!"));
    }
  }
};
