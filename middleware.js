import { User } from "./database_model.js";
import { sendError } from "./utils.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

export const isAuthenticated = async (req, res, next) => {
    try{
        const token = req.cookies?.token;
        if(!token){
            return res.redirect("/login");
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.id);
        req.user = user;
        next()
    }catch(error){
        return sendError(res, 500, error.message)
    }
}