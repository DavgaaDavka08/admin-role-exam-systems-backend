import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    role:{type:String,enum:["admin","user","manager"],default:"user"},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date, default:Date.now},
},{timestamps:true})
const User=mongoose.model("Users",UserSchema)
export default User;    