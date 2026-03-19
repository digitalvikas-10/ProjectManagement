import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

/*
const healthCheck = async(req,res)=>{
    try {
        res.status(200).json(
            new ApiResponse(200,{message:"Server is running"})
        )
    } catch (error) {
        console.log(error)
    }
}
*/

const healthCheck = asyncHandler((req,res)=>{
    res.status(200).json(
        new ApiResponse(200,{message:"server is running"})
    )
})
export {healthCheck}