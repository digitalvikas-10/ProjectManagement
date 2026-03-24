import { User } from "../Models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import { emailVerificationMailgenContent } from "../utils/mail.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password, confirmPassword } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(
      401,
      "user with this email or password is already existed",
    );
  }

  const user = await User.create({
    username,
    email,
    fullName,
    password,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken} `,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }
  res.status(201).json(
    new ApiResponse(
      200,
      {
        message:
          "User registered successfully and email verification link has been sent on your email",
      },
      { createdUser },
    ),
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !username) {
    throw new ApiError(401, "Username or email is not found");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "User or username are not existed");
  }

  const isPasswordCorrect = await user.isPassowrdCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Something went wrong");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        {
          meassage: "user loggedIn successfully",
        },
      ),
    );
});

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:""
      }
    },
    {
      new:true,
    }
   );
   const options = {
    httpOnly:true,
    secure:true
   }
   return res
          .status(200)
          .clearCookie("accessToken",options)
          .clearCookie("refreshToken",options)
          .json(
            new ApiResponse(200,{
              message:"user loggedout successfully"
            })
          )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
          .status(200)
          .json(
            new ApiResponse(
              200,
             req.user,
             "current user fetched successfully"
            )
          )
})

const verifyEmail = asyncHandler(async(req,res)=>{
      const {verificationToken} = req.params
    if(!verificationToken){
      throw new ApiError(400,"Email verificatiion token is missing")
    }

  let hashedToken = crypto
                   .createrHash("sha256")
                   .update(verificationToken)
                   .digest("hex")

    const user =    await User.findOne(
      {
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
      }
    )  
    
    if(!user){
       throw new ApiError(400,"Token is invalid or expired")
    }
     
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
 

    user.isEmailVerified = true
    await user.save({validateBeforeSave:false})
   return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              {
                isEmailVerified:true
              },
              "Email is verified"
            )
          )
})

const resendEmailVerification = asyncHandler(async(req,res)=>{
      const user =   await User.findById(req.user._id)

      if(!user){
        throw new ApiError(404,"user doesn't exist")
      }

      if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified")
      }

      const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken} `,
    ),
  });

  return res
        .status(200)
        .json(
          new ApiResponse(200,
            "Mail has been sent to your id"
          )
        )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
       const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

       if(!incomingRefreshToken){
        throw new ApiError("Unauthorized access")
       }

       try {
         const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

       const user =  await User.findById(decodedToken?._id)
       if(!user){
        throw new ApiError(401,"Invalid refresh token")
       }

       if(incomingRefreshToken != user?.refreshToken){
        throw new ApiError(401,"refresh token is expired")
       }
         
       const options = {
        httpOnly:true,
        secure:true
       }

      const {accessToken,refreshToken:newRefreshToken} =  await generateAccessAndRefreshToken(user._id)
       
      user.refreshToken = newRefreshToken
      await user.save()

      return res
             .status(200)
             .cookie("accessToken",accessToken,options)
             .cookie("refreshToken",newRefreshToken,options)
             .json(
              new ApiResponse(200,
                {
                  accessToken,
                  refreshToken:newRefreshToken
                },
                "AccessToken refreshed"
              )
             )
       } catch (error) {
         throw new ApiError(401,"Invalid refreshToken")
       }
})


const forgotPassword = asyncHandler(async(req,res)=>{
       const {email} =req.body;

      const user =  await User.findOne({email})

      if(!user){
        throw new ApiError(404,"user doesn't exist",[])
      }

       const {unHashedToken,hashedToken,tokenExpiry} =   user.generateTemporaryToken()
   
       user.forgotPasswordToken = hashedToken
       user.forgotPasswordExpiry = tokenExpiry

       await user.save({validateBeforeSave:false})

       await sendEmail({
         email:user?.email,
         subject:"password reset request",
         mailgenContent: forgotPasswordMailgenContent(
          user.username,
          `${process.env.FORGOT_PASSWORD_REDIRECT_URL}//${unHashedToken}`
         )
       })

       return res
              .status(200)
              .json(
                new ApiResponse(200,
                  {message:"password reset mail has been on your mail"}
                )
              )

})

const resetForgotPassword = asyncHandler(async(req,res)=>{
  const {resetToken} = req.params
  const {newPassword} = req.body

  let hashedToken = crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex")

 const user =  await User.findOne({
    forgotPasswordToken:hashedToken,
    forgotPasswordExpiry:{$gt:Date.now}
  })  
  
  if(!user){
    throw new ApiError("Token is invalid or expired")
  }

  user.forgotPasswordExpiry = undefined
  user.forgotPasswordToken = undefined

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res 
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "Password reset successfully"
          )
        )
})

const changePassword = asyncHandler(async(req,res)=>{
   const {oldPassword,newPassword} = req.body
   
   const user = await User.findById(req.user._id)

  const isPasswordValid =  await user.isPassowrdCorrect(oldPassword)

  if(!isPasswordValid){
    throw new ApiError(400,"Invalid old password")
  }
  
  user.password = newPassword()
  await user.save({validateBeforeSave:false})

  return res
         .staus(200)
         .json(
          new ApiResponse(
            200,
            {},
            "password changed successfully"
          )
         )
})

export { registerUser, loginUser,logoutUser,getCurrentUser,forgotPassword,verifyEmail,resendEmailVerification,refreshAccessToken,resetForgotPassword,changePassword};
