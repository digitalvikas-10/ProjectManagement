import { Router } from "express";
import {
    changePassword,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validator } from "../Middlewares/validator.middleware.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from "../Validators/index.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

// unsecure route to access this we don't need user
router
  .route("/register")
  .post(userRegisterValidator(), validator, registerUser);
router.route("/login").post(userLoginValidator(), validator, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validator, forgotPassword);
router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validator, resetForgotPassword);

// secured route to access this route we need to login first
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/current-user").post(verifyJwt, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJwt,
    userChangeCurrentPasswordValidator(),
    validator,
    changePassword
  );
  router.route("/resend-emai-verification").post(verifyJwt,resendEmailVerification);

export default router;
