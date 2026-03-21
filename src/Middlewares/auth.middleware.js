import { User } from "../Models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-Error.js";
import jwt from "jsonwebtoken"

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