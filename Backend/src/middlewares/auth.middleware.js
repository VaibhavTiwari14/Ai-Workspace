import { APIError } from "../utils/APIError.utils.js";
import { asyncHandler } from "../utils/AsyncHandler.utils.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const varifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new APIError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new APIError(401, "invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new APIError(401, "Invalid token");
  }
});
