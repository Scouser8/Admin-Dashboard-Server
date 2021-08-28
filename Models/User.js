const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = mongoose.Schema(
  {
    email: {
      type: "String",
      unique: true,
      required: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: "String",
      required: true,
    },
    first_name: {
      type: "String",
      required: true,
    },
    last_name: {
      type: "String",
      required: true,
    },
    status: {
      type: "String",
      default: "inactive",
    },
  },
  { timestamps: true }
);

// To prevent sending the password when returning
// the user object to the client.
userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
