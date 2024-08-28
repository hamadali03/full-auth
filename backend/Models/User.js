import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
 email: {
    type: String,
    required: true,  // corrected from require to required
    unique: true
  },
  password: {
    type: String,
    required: true  // corrected from require to required
  },
  name: {
    type: String,
    required: true  // corrected from require to required
  },
 lastLogin:{
   type:Date,
   default:Date.now
 },

 isVerified:{
    type:Boolean,
    default:false
 },

 resetPasswordToken:String,
 resetPasswordExpiresAt:Date,
 verificationToken:String,
 verificationTokenExpireAt:Date,


},{timestamps:true})

const Users = mongoose.models.User || mongoose.model('User',userSchema)

export default Users;
