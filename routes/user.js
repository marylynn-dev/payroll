const express = require("express");
const router = express.Router();
const {
  requestAccess,
  register,
  logIn,
  refreshToken,
  logOut,
  get,
} = require("../controllers/user");
const { verifyAccessToken } = require("../middleware/jwt");

router.post("/request-access", requestAccess)
router.post("/register", register);
router.post("/login", logIn);
router.post("/refresh-token", refreshToken);
router.delete("/logout", logOut);
router.get("/get", verifyAccessToken, get);

module.exports = router;
