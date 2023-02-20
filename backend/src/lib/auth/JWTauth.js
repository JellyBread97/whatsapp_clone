import createHttpError from "http-errors";
import { verifyAccessToken } from "../tools/tools.js";

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
      next();
    } catch (error) {
      console.log(error);

      next(createHttpError(401, "Token not valid!"));
    }
  }
};
