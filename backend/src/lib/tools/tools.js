import jwt from "jsonwebtoken";

export const createTokens = async (user) => {
  const accessToken = await createAccessToken({ _id: user._id, role: user.username });
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
    })
  );
