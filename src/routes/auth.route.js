import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { validator } from "../Middlewares/validator.middleware.js";
import {userLoginValidator, userRegisterValidator} from "../Validators/index.js"
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(userRegisterValidator(),validator,registerUser)
router.route("/login").post(userLoginValidator(),validator,loginUser)
router.route("/logout").post(verifyJwt,logoutUser)

export default router