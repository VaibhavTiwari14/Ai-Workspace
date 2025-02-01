import { User } from '../models/user.model.js';
import { registerUser } from '../../services/user.service.js';
import { validationResult } from 'express-validator';
import { APIError } from '../utils/APIError.utils.js';
import { APIResponse } from "../utils/APIResponse.utils.js";

const registerUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(
            new APIError(400, "Invalid Request", errors.array())
        );
    }

    try {
        const user = await registerUser(req);
        if (!user) {
            return res.status(400).json(
                new APIError(400, "Error while creating a user in database")
            );
        }
        return res.status(201).json(
            new APIResponse(201, "User created Successfully", user)
        );
    } catch (error) {
        return res.status(400).json(
            new APIError(400, "Error while creating a user in database", error.message)
        );
    }
};

export { registerUserController };