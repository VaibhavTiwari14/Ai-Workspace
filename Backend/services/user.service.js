import { User } from "../src/models/user.model.js";
import { APIError } from "../src/utils/APIError.utils.js";
import {
  uploadOnCloudinary,
  deleteImageFromCloudinary,
} from "./cloudinary.service.js";

import {
  DEFAULT_MALE_AVATAR,
  DEFAULT_FEMALE_AVATAR,
  DEFAULT_AVATAR,
} from "../constants.js";
import { asyncHandler } from "../src/utils/AsyncHandler.utils.js";

const generateAccessAndRefreshTokens = asyncHandler(async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new APIError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    const savedUser = await user.save({ validateBeforeSave: false });

    if (!savedUser) {
      console.error("User not saved after token generation");
      throw new APIError(500, "Error saving refresh token");
    }

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    } else if (error.name === "ValidationError") {
      console.error("Validation Error while saving refresh token:", error);
      throw new APIError(
        400,
        "Validation error while saving refresh token",
        error
      );
    } else {
      console.error("Error generating/saving tokens:", error);
      throw new APIError(500, "Error generating or saving tokens", error);
    }
  }
});

const registerUser = asyncHandler(async (req) => {
  const { fullname, email, username, password, gender } = req.body;

  // Validate required fields
  if (!fullname || !username || !email || !password || !gender) {
    throw new APIError(400, "Please provide all required fields");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Please provide a valid email address");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new APIError(
      400,
      "User with the same username or email already exists"
    );
  }

  // Handle avatar upload
  let avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    avatarLocalPath =
      gender === "Male"
        ? DEFAULT_MALE_AVATAR
        : gender === "Female"
          ? DEFAULT_FEMALE_AVATAR
          : DEFAULT_AVATAR;
  }

  // Upload avatar to Cloudinary
  const avatarURL = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarURL || !avatarURL.url) {
    throw new APIError(400, "Error uploading avatar");
  }

  // Create user
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    gender,
    avatar: avatarURL.url,
  });

  // Fetch user without sensitive data
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) {
    throw new APIError(500, "Error creating user");
  }

  return userCreated;
});

const loginUser = asyncHandler(async (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new APIError(400, "Please provide all login information");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Please provide a valid email address");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new APIError(401, "Invalid credentials");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new APIError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return { accessToken, refreshToken, loggedInUser };
});

const logoutUser = asyncHandler(async (req) => {
  const userId = req.user._id;

  try {
    await User.findByIdAndUpdate(
      userId,
      {
        $unset: { refreshToken: 1 },
      },
      {
        new: true,
      }
    );
    return "done";
  } catch (error) {
    return "error";
  }
});

export { loginUser, registerUser, logoutUser };
