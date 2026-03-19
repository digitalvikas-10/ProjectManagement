import { body } from "express-validator";

const userRegisterValidator = ()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),

        body("username")
        .trim()
        .notEmpty()
        .withMessage("username is required")
        .isLowercase()
        .withMessage("Username needs to be in lowerCase")
        .isLength({min:3})
        .withMessage("Username must be atleast three character long"),

        body("password")
        .trim()
        .notEmpty()
        .withMessage("password sis required")
        .isLength({min:8})
        .withMessage("password should be minimum of eight character")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage("Password must include uppercase, lowercase, number, and special character"),

        body("fullName")
        .optional()
        .trim()
    ]
}

export {
    userRegisterValidator
}