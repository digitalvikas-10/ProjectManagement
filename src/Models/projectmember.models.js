import mongoose, { Schema } from "mongoose";
import {AvailableUserRole,userRoleEnum} from "../utils/constants.js"


const projecMemberSchema = new mongoose.Schema({
      user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
      },
      project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
      },
      role:{
        type:String,
        enum:AvailableUserRole,
        default:userRoleEnum.MEMBER
      }

},{timestamps:true})


export const ProjectMember = mongoose.model("ProjectMember",projecMemberSchema);