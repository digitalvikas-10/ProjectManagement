import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";

const userRegisterValidator = () => {
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
      .isLength({ min: 3 })
      .withMessage("Username must be atleast three character long"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("password sis required")
      .isLength({ min: 8 })
      .withMessage("password should be minimum of eight character")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage(
        "Password must include uppercase, lowercase, number, and special character",
      ),

    body("fullName").optional().trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .notEmpty()
      .isEmail()
      .withMessage("Email is required to login user"),

    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  retrun[
    (body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword").notEmpty().withMessage("new password is required"))
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [
    body("newPassword").notEmpty().withMessage("new password is required"),
  ];
};

const createProjectValidator = ()=>{
  return [
    body("name")
    .notEmpty()
    .withMessage("name is required"),

    body("description")
    .optional
  ]
}

const addMemberToProjectValidator = ()=>{
  return[
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("email is invalid"),


    body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn(AvailableUserRole)
    .withMessage("role is invalid")
  ]
}

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMemberToProjectValidator
};
