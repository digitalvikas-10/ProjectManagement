import { User } from "../Models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";
import { emailVerificationMailgenContent } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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
  res
    .status(201)
    .json(
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
    throw new ApiError(401,"Username or email is not found")
  }

  const user = await User.findOne({$or:[{email},{username}]})

  if(!user){
    throw new ApiError(404,"User or username are not existed")
  }
 
   const isPasswordCorrect =  await user.isPasswordCorrect(password)

   if(!isPasswordCorrect){
    throw new ApiError(401,"Something went wrong")
   }

  const {accessToken,refreshToken} =  await generateAccessAndRefreshToken(user._id);
  
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = {
    httpOnly:true,
    secure:true
  }

  return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(200,{
          user:loggedInUser,
          accessToken,
          refreshToken
        },{
          message:"user loggedIn successfully"
        }
      )


});

export { registerUser, loginUser };
