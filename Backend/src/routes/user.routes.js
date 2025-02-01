import { Router } from "express";
import {
  registerUserController,
  loginUserController,
  logoutUserController,
} from "../controllers/user.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

const userRouter = Router();

const validateRegister = [
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  body("password").notEmpty().withMessage("Password is required"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

userRouter
  .route("/register")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    validateRegister,
    registerUserController
  );

userRouter
  .route("/login")
  .post(loginLimiter, validateLogin, loginUserController);

userRouter.route("/logout").post(varifyJWT, logoutUserController);

export default userRouter;
