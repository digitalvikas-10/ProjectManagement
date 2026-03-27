import { User } from "../Models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-Error.js";
import jwt from "jsonwebtoken"
import { ProjectMember } from "../Models/projectmember.models.js";
import mongoose from "mongoose";

export const verifyJwt = asyncHandler(async(req,res,next)=>{
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")

    if(!token){
        throw new ApiError(401, "unauthorized request")
    }

   try {
    const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  const user =   await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

  if(!user){
    throw new ApiError(401,"Invalid access token")
  }
  req.user = user;
   next()
   } catch (error) {
      throw new ApiError(401,"Invalid access token")
   }
})


export const validateProjectPermission = (roles=[])=>{
   asyncHandler(async(req,res,next)=>{
    const{projectId}=req.params;
          
    if(!projectId){
      throw new ApiError(400,"projectid is missing")
    }

   const project =  await ProjectMember.findOne({
      project:new mongoose.Types.ObjectId(projectId),
      user:new mongoose.Types.ObjectId(req.user._id)
    })
    
    if(!project){
      throw new ApiError(400,"projectid not found")
    }
    
    const givenRole = project?.role

    req.user.role = givenRole
   
    roles.includes(givenRole)
     if(!roles.includes(givenRole)){
      throw new ApiError(403,"You do not have permission to perform this action")
     }

     next()

   })
}