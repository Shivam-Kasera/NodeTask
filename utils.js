import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

export const isAuthenticated = (req) => {
    const token = req.cookies?.token;
    if(!token){
        return false;
    }
    return true;
}

export const sendError = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
}

export const sendToken = async (res, user, set, message) => {
    try{
        let token;
        if(set){
            token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        }
        return res.cookie("token", set ? token : null, {
            maxAge: set ? 24 * 60 * 60 * 1000 : 0
        }).status(200).json({
            success: true,
            message,
            user
        });
    }catch(error){
        return sendError(res, 500, error.message);
    }
}