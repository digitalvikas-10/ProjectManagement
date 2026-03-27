import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../Models/project.models.js";
import { User } from "../Models/user.models.js";
import { ProjectMember } from "../Models/projectmember.models.js";
import mongoose from "mongoose";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup:{
        from:"projects",
        localField:"projects",
        foreignField:"_id",
        as:"projects",
        pipeline:[
          {
            $lookup:{
              from:"projectmembers",
              localField:"_id",
              foreignField:"projects",
              as:"projectmembers"
            }
          },
          {
            $addFields:{
              members:{
                $size:"$projectmembers",
              }
            }
          }
        ]
      },
    },
    {
      $unwind:"$project"
    },
    {
      $project:{
        project:{
          _id:1,
          name:1,
          description:1,
          members:1,
          createdAt:1,
          createdBy:1
        },
        role:1,
        _id:0
      }
    }
  ]);
 
  if(!projects){
    throw new ApiError(404,"projects not found")
  }

  return res
         .status(200)
         .json(
          new ApiResponse(
            200,
            projects,
            "projects fetched successfully"
          )
         )
});

const getPorjectById = asyncHandler(async (req, res) => {
  const {projectId} = req.params
  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(404,"Project not found")
  }
   
  return res
       .status(200)
       .json(
        new ApiResponse(
          200,
          project,
          "project fetched successfully"
        )
       )

});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(
      401,
      "Name and description are required to create project",
    );
  }

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: userRoleEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    {
      new: true,
    },
  );

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  return res.status.json(
    new ApiResponse(200, project, "project updated successfully"),
  );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "project not found");
  }

  return res.status.json(
    new ApiResponse(200, project, "project updated successfully"),
  );
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const{email,role} = req.body
  const{projectId} = req.params

  const user = await User.findOne({email})

  if(!user){
    throw new ApiError(404,"user doesn't exist")
  }
 
  await ProjectMember.findByIdAndUpdate(
    {
      user:new mongoose.Types.ObjectId(user._id),
      project:new mongoose.Types.ObjectId(projectId)
    },
    {
      user:new mongoose.Types.ObjectId(user._id),
      project:new mongoose.Types.ObjectId(projectId),
      role:role
    },
    {
      new:true,
      upsert:true
    }
  )
    
  return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            {},
            "project member added successfully"
          )
        )
});

const getProjectMember = asyncHandler(async (req, res) => {
  const{projectId} = req.params

  const project = await Project.findById(req.params)

  if(!project){
    throw new ApiError(404,"project not found")
  }

  const projectMembers = await ProjectMember.aggregate(
    [
      {
        $match:{
          project:new mongoose.Types.ObjectId(projectId)
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"user",
          foreignField:"_id",
          as:"user",
          pipeline:[
            {
              $project:{
                _id:1,
                username:1,
                fullName:1,
                avatar:1
              }
            }
          ]
        }
      },
      {
          $addFields:{
            user:{
              $arrayElemAt:["$user",0]
            }
          }
      },
      {
        $project:{
          project:1,
          user:1,
          createdAt:1,
          updatedAt:1,
          _id:0
        }
      }
    ]
  )

  return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            projectMembers,
            "projected member fetched successfully"
          )
        )
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const {projectId,userId} = req.params
   const {newRole} = req.body

   if(!AvailableUserRole.includes(newRole)){
    throw new ApiError(400,"Invalid Role")
   }

   let projectMember = await ProjectMember.findOne({
    project:new mongoose.Types.ObjectId(projectId),
    user:new mongoose.Types.ObjectId(userId)
   })
   
   if(!projectMember){
    throw new ApiError(400,"projectMember not found")
   }

   projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      role:newRole
    },
    {
      new:true
    }
   )

   if(!projectMember){
    throw new ApiError(400,"projectMember not found")
   }

   return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              projectMember,
              "project member role updated successfully"
            )
          )

});

const deleteMember = asyncHandler(async (req, res) => {
   const {projectId,userId} = req.params

   

   let projectMember = await ProjectMember.findOne({
    project:new mongoose.Types.ObjectId(projectId),
    user:new mongoose.Types.ObjectId(userId)
   })
   
   if(!projectMember){
    throw new ApiError(400,"projectMember not found")
   }

   projectMember = await ProjectMember.findByIdAndDelete(
    projectMember._id
   )

   if(!projectMember){
    throw new ApiError(400,"projectMember not found")
   }

   return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              projectMember,
              "project member role deleted successfully"
            )
          )
});

export {
  getPorjectById,
  getProjects,
  getProjectMember,
  deleteMember,
  deleteProject,
  updateMemberRole,
  updateProject,
  addMemberToProject,
  createProject,
};
