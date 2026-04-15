const User = require("../models/user");
const Employee = require("../models/employee");
const {
  userValidation,
  requestAccessValidation,
} = require("../middleware/validation");
const createError = require("http-errors");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../middleware/jwt");
const Client = require("../config/redis");

const requestAccess = async (req, res, next) => {
  try {
    // Use the specific schema that doesn't require a password
    const result = await requestAccessValidation.validateAsync(req.body);

    const doesExist = await Employee.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(
        `${result.email} already has a pending request`,
      );

    const nameParts = result.fullName.split(" ");
    const employee = new Employee({
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || "",
      email: result.email,
      status: "pending",
    });

    await employee.save();
    res.status(201).send({ message: "Access request sent to HR." });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await userValidation.validateAsync(req.body);

    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(`${result.email} has already been registered`);
    const user = new User({ ...result, role: req.body.role });
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser);
    const refreshToken = await signRefreshToken(savedUser.id);
    const userObj = savedUser.toObject ? savedUser.toObject() : savedUser;
    const { password, ...passwordLessUser } = userObj;
    res.send({ accessToken, refreshToken, user: passwordLessUser });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};
const logIn = async (req, res, next) => {
  try {
    const result = await userValidation.validate(req.body);
    const user = await User.findOne({ email: result.value.email });

    if (!user) throw createError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(result.value.password);
    if (!isMatch)
      throw createError.Unauthorized("Username/Password is not valid");

    const accessToken = await signAccessToken(user);
    const refreshToken = await signRefreshToken(user.id);

    // ✅ UPDATED: Send user details (including role) along with tokens
    res.send({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role, // This allows the frontend to redirect correctly
      },
    });
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Username/Password"));
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken, refToken });
  } catch (error) {
    next(error);
  }
};

const logOut = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    Client.DEL(userId, (err, value) => {
      if (err) {
        console.log(err.message);
        throw createError.InternalServerError();
      }
      console.log(value);
      res.sendStatus(204);
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId)
      throw createError.Unauthorized("Access token missing or invalid");

    const user = await User.findById(userId).select("-password");
    if (!user) throw createError.NotFound("User not found");

    res.send({ user });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    // Get ID from the verified token (req.user) or from URL params
    const id = req.params.id || (req.user && req.user.aud);

    if (!id) throw createError.BadRequest("User ID required");

    // Define what fields are allowed to be updated via this route
    // (Prevents users from injecting "role: admin" into the request)
    const updates = req.body;
    const allowedUpdates = ["firstName", "lastName", "email", "position"];

    // Filter the body to only include allowed fields
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) throw createError.NotFound("User not found");

    res.send({
      message: "Update successful",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  requestAccess,
  register,
  logIn,
  refreshToken,
  logOut,
  get,
  update,
};
