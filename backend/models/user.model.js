import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        }, 
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, "Username must be at least 3 characters"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: {
                values: ["male", "female"],
                message: "Gender must be either 'male' or 'female'"
            }
        },
        profilePic: {
            type: String,
            default: ""
        }
    },
    { 
        timestamps: true 
    }
);

const User = mongoose.model("User", userSchema);
export default User;
