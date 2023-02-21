import { check } from "express-validator";
import jwt from "jsonwebtoken";
import UsersModel from "../../api/user/model.js";
import createHttpError from "http-errors";

export const createTokens = async (user) => {
  const accessToken = await createAccessToken({ _id: user._id, username: user.username });
  const refreshToken = await createRefreshToken({ _id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const createAccessToken = (payload) => {
  console.log("JWT_SECRET: ", process.env.JWT_SECRET);
  return new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    })
  );
};

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) reject(err);
      else resolve(originalPayload);
    })
  );
const createRefreshToken = (payload) => {
  console.log("JWT_SECRET: ", process.env.JWT_SECRET);
  return new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    })
  );
};

export const verifyRefreshToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) reject(err);
      else resolve(originalPayload);
      console.log("refresh token", originalPayload);
    })
  );

export const verifyRefreshAndCreateNewTokens = async (currentRefreshToken) => {
  try {
    // 1. Check the integrity and expiration date of refresh token. We gonna catch potential errors
    const { _id } = await verifyRefreshToken(currentRefreshToken);

    // 2. If the token is valid, let's compare it with the one we have in db
    const user = await UsersModel.findById(_id);
    if (!user) throw new createHttpError(404, `User with id ${_id} not found!`);

    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      // 3. If everything is fine --> create 2 new tokens (saving refresh in db)
      const { accessToken, refreshToken } = await createTokens(user);
      // 4. Return the tokens
      return { accessToken, refreshToken };
    } else {
      throw new createHttpError(401, "Refresh token not valid!");
    }
  } catch (error) {
    // 5. In case of errors --> catch'em and send 401
  }
};

export const verifyRefreshAndCreateNewTokensUpdate = async (req) => {
  try {
    console.log("req: ", req.headers);
    const refreshToken = req.headers.authorization.replace("Bearer ", "");

    const { _id } = await verifyRefreshToken(refreshToken);

    const user = await UsersModel.findById(_id);
    if (!user) throw new createHttpError(404, `User with id ${_id} not found!`);

    if (user.refreshToken && user.refreshToken === refreshToken) {
      const { accessToken, refreshToken } = await createTokens(user);

      return { accessToken, refreshToken };
    } else {
      throw new createHttpError(401, "Refresh token not valid!");
    }
  } catch (error) {
    throw new createHttpError(401, "Refresh token not valid!");
  }
};
