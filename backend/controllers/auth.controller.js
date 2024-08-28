import { sendVerificationEmail, sendWelcomeEmail,sendPasswordResetEmail,sendResetSuccessEmail } from "../mailtrap/email.js"
import crypto from "crypto";

import Users from "../Models/User.js"
import {generateTokenAndSetCookie} from "../Utils/generateTokenAndSetCookie.js"
import bcryptjs from "bcryptjs"

 const signup = async (req,resp)=>{
    const {email,password,name} = req.body 
    try {
       if(!email || !password || !name){
         throw new Error("All fields are required")
       }

       const userAlreadyExits=await Users.findOne({email});
       if(userAlreadyExits){
        return resp.status(400).json({success:false,message:"User already Exit"})
       }
        
       const hashPassword= await bcryptjs.hash(password,10);
        const verificationToken= Math.floor(100000 + Math.random()*900000).toString();
       const user=new Users({
        email,
        password:hashPassword,
        name,
        verificationToken,
        verificationTokenExpireAt:Date.now() + 24 * 60 * 60 * 1000 //24 hours
       });

       await user.save()

       //jwt
       generateTokenAndSetCookie(resp,user._id)
      await sendVerificationEmail(user.email,verificationToken)
   
       
       resp.status(201).json({
        success:true,
        message:"User Create Successfully",
        user:{
            ...user._doc,
            password:undefined,
        }
       })
    } catch (error) {
        return resp.status(400).json({success:false,message:error.message})
    }
 }

 const verifyEmail = async (req,resp)=>{
    const {code} = req.body;
    try {
        const user = await Users.findOne({
			verificationToken: code,
			verificationTokenExpireAt: { $gt: Date.now() },
		});


        if(!user){
            return resp.status(400).json({success:false,message:"Invalid or expired verification code"})
        }

        user.isVerified=true;
        user.verificationToken=undefined;
        user.verificationTokenExpireAt=undefined;
        await user.save()

        await sendWelcomeEmail(user.email,user.name);
        
        resp.status(201).json({
            success:true,
            message:"Email Verified Successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
           })

    } catch (error) {
        console.log("error in verifyEmail ", error);
		resp.status(500).json({ success: false, message: "Server error" });
    }
 }

  const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await Users.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "Email not verified" });
        }
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await Users.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

const resetPassword = async (req, res) => {
	
    try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await Users.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}

};

 const checkAuth = async (req,resp)=>{
    try {
		const user = await Users.findById(req.userId).select("-password");
		if (!user) {
			return resp.status(400).json({ success: false, message: "User not found" });
		}

		resp.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		resp.status(400).json({ success: false, message: error.message });
	}
 }

 export {signup,login,logout,verifyEmail,checkAuth,forgotPassword,resetPassword}