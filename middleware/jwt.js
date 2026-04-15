const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("../config/redis");

// ---------------- Sign Access Token ----------------
const signAccessToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      name: user.name || user.email,
      role: user.role,
      userId: user._id,
    };
    console.log(payload);
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "8h",
      issuer: "me.com",
      audience: String(user._id),
    };

    JWT.sign(payload, secret, options, (error, token) => {
      if (error) {
        console.log(error);
        reject(createError.InternalServerError());
      } else {
        resolve(token);
      }
    });
  });
};

// ---------------- Verify Access Token ----------------
const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return next(createError.Unauthorized());

  const bearerToken = authHeader.split(" ");

  if (bearerToken.length !== 2 || bearerToken[0] !== "Bearer") {
    return next(createError.Unauthorized());
  }

  const token = bearerToken[1];

  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err && err.name === "JsonWebTokenError") {
      return next(createError.Unauthorized(err.message));
    } else if (err) {
      return next(createError.Unauthorized());
    }

    // ✅ store payload into req.user instead of req.payload
    req.user = payload;

    next();
  });
};

// ---------------- Sign Refresh Token ----------------
const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { name: "yours truly" };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "me.com",
      audience: userId,
    };

    JWT.sign(payload, secret, options, (error, token) => {
      if (error) {
        console.log(error);
        reject(createError.InternalServerError());
      } else {
        client.SET(userId, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            console.log(err.message);
            reject(createError.InternalServerError());
            return;
          }
        });
      }
      resolve(token);
    });
  });
};

// ---------------- Verify Refresh Token ----------------
const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;

        client.GET(userId, (err, result) => {
          if (err) {
            console.log(err.message);
            reject(createError.InternalServerError());
          }
          if (refreshToken === result) return resolve(userId);
          reject(createError.Unauthorized());
        });
      }
    );
  });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
