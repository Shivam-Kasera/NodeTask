import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tasks: [
        {
            title: String,
            desc: String,
            createdAt: Date
        }
    ]
}, { timestamps: true });

export const User = mongoose.model("users", userSchema)