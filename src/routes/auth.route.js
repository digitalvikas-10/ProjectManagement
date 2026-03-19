import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { validator } from "../Middlewares/validator.middleware.js";
import {userRegisterValidator} from "../Validators/index.js"

const router = Router()

router.route("/register").post(userRegisterValidator(),validator,registerUser)
router.route("/login").post(loginUser)

export default router