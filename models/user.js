const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: String, enum: ["admin", "hr", "employee"] },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  try {
    // Only hash if password field is new or modified
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.post("save", async function (next) {
  try {
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    console.log(password, this.password);
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("user", userSchema);

module.exports = User;
