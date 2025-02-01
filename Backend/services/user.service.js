import { User } from "../src/models/user.model.js";
import {APIError} from "../src/utils/APIError.utils.js";
import { uploadOnCloudinary,deleteImageFromCloudinary } from './cloudinary.service.js';


import {DEFAULT_MALE_AVATAR,DEFAULT_FEMALE_AVATAR,DEFAULT_AVATAR} from "../constants.js"
import { asyncHandler } from "../src/utils/AsyncHandler.utils.js";


export const registerUser = asyncHandler(async (req) => {
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
        throw new APIError(400, "User with the same username or email already exists");
    }

    // Handle avatar upload
    let avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        avatarLocalPath =
            gender === "Male" ? DEFAULT_MALE_AVATAR
            : gender === "Female" ? DEFAULT_FEMALE_AVATAR
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
        avatar: avatarURL.url
    });

    // Fetch user without sensitive data
    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if (!userCreated) {
        throw new APIError(500, "Error creating user");
    }

    return userCreated;
});
