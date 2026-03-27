import express from "express";
import {
  createProject,
  getPorjectById,
  getProjects,
  getProjectMember,
  deleteMember,
  deleteProject,
  updateMemberRole,
  updateProject,
  addMemberToProject,
} from "../controllers/project.controller.js";
import {
  verifyJwt,
  validateProjectPermission,
} from "../Middlewares/auth.middleware";
import { validator } from "../Middlewares/validator.middleware.js";
import {
  addMemberToProjectValidator,
  createProjectValidator,
} from "../Validators/index.js";
import { AvailableUserRole, userRoleEnum } from "../utils/constants";

const projectRouter = express.Router();

projectRouter.use(verifyJwt);

projectRouter
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validator, createProject);

projectRouter
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getPorjectById)
  .put(
    validateProjectPermission([userRoleEnum.ADMIN, userRoleEnum.MEMBER]),
    createProjectValidator(),
    validator,
    updateProject,
  )
  .delete(validateProjectPermission([userRoleEnum.ADMIN]), deleteProject);

projectRouter
  .route("/:projectId/members")
  .get(getProjectMember)
  .post(
    validateProjectPermission([userRoleEnum.ADMIN]),
    addMemberToProjectValidator(),
    validator,
    addMemberToProject,
  );

projectRouter
  .route("/:projectId/members/:userId")
  .put(
    validateProjectPermission([userRoleEnum.ADMIN, userRoleEnum.MEMBER]),
    updateMemberRole,
  )
  .delete(
    validateProjectPermission([userRoleEnum.ADMIN, userRoleEnum.MEMBER]),
    deleteMember,
  );

export default projectRouter;
