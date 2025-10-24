import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationCode;
  return user;
};
userSchema.pre('remove', async function (next) {
  try {
    await mongoose.model('File').deleteMany({ userId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.pre('remove', async function (next) {
  try {
    await mongoose.model('Vital').deleteMany({ userId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const userId = this.getQuery()._id;
    await mongoose.model("File").deleteMany({ userId });
    await mongoose.model("Vital").deleteMany({ userId });
    next();
  } catch (err) {
    next(err);
  }
});
export const User = mongoose.model("User", userSchema);
