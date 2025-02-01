import { User } from "../models/user.model.js";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../../services/user.service.js";
import { APIError } from "../utils/APIError.utils.js";
import { APIResponse } from "../utils/APIResponse.utils.js";
import { cookieOptions } from "../../constants.js";
import { asyncHandler } from "../utils/AsyncHandler.utils.js";

const registerUserController = asyncHandler(async (req, res) => {
  try {
    const user = await registerUser(req);
    if (!user) {
      return res
        .status(400)
        .json(new APIError(400, "Error while creating a user in database"));
    }
    return res
      .status(201)
      .json(new APIResponse(201, "User created Successfully", user));
  } catch (error) {
    return res
      .status(400)
      .json(
        new APIError(
          400,
          "Error while creating a user in database",
          error.message
        )
      );
  }
});

const loginUserController = asyncHandler(async (req, res) => {
  try {
    const { accessToken, refreshToken, loggedInUser } = await loginUser(req);

    if (!loggedInUser) {
      throw new APIError(401, "Invalid credentials or user not found");
    }

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
      })
      .json(
        new APIResponse(
          200,
          { user: loggedInUser, accessToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    return res
      .status(401)
      .json(new APIError(401, error.message || "Login failed"));
  }
});

const logoutUserController = asyncHandler(async (req, res) => {
  try {
    const ans = await logoutUser(req);
    if (ans === "done") {
      return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new APIResponse(200, {}, "User logged out successfully"));
    }else{
        return res.status(500).json(
            new APIError(500,"Error while logging out please try again later")
        )
    }
  } catch (error) {
    return res
      .status(500)
      .json(
        new APIError(500, "Error while logging out please try again later")
      );
  }
});

export { registerUserController, loginUserController, logoutUserController};
