import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../Models/project.models.js";
import { User } from "../Models/user.models.js";
import mongoose from "mongoose";
import { Task } from "../Models/task.models.js";
import { SubTask } from "../Models/subtask.models.js";

const getTask = asyncHandler(async (req, res) => {});
const createTask = asyncHandler(async (req, res) => {});
const getTaskById = asyncHandler(async (req, res) => {});
const updateTask = asyncHandler(async (req, res) => {});
const deleteTask = asyncHandler(async (req, res) => {});
const createSubTask = asyncHandler(async (req, res) => {});
const updateSubTask = asyncHandler(async (req, res) => {});
const deleteSubTask = asyncHandler(async (req, res) => {});

export {
  getTask,
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  updateSubTask,
  updateTask,
};
