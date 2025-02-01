import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    fullname : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    username : {
        type : String,
        required : true,
        index: true,
        unique : true,
        trim : true,
        lowercase : true,
        minLength : [3, "Username must be atleast 3 characters long"],
        maxLength : [20, "Username must be atmost 20 characters long"]
    },
    gender : {
        type : String,
        enum : ["Male","Female","Other"],
        default : "Other"
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        minLength : [6, "Email must be atleast 6 characters long"],
        maxLength : [50, "Email must be atmost 50 characters long"]
    },
    password : {
        type : String,
        required : [true, "Password is required"],
        select : false,
        trim : true,
        minLength : [4, "Password must be atleast 4 characters long"],
        maxLength : [50, "Password must be atmost 50 characters long"]
    },
    avatar : {
        type : String, 
    },
    refreshToken : {
        type : String,
        select : false
    }
},{
    timestamps: true
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
       return next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        fullname : this.fullname,
        username : this.username
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  };
  
  userSchema.methods.generateRefreshToken = function () { 
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
  };

export const User = mongoose.model("User", userSchema);