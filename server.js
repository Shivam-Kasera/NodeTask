import express, { urlencoded } from "express";
import path from "path";
import dotenv from "dotenv";
import { sendError, sendToken } from "./utils.js"
import { isAuthenticated } from "./middleware.js"
import cookieParser from "cookie-parser";
import { database_connection } from "./database_connection.js";
import { User } from "./database_model.js"
import { compare, hash } from "bcrypt";

dotenv.config({ path: "./config.env" });

const __dirname = path.dirname(import.meta.url).split(":///")[1]
database_connection()
const app = express();
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, 'css')));

app.get("/", isAuthenticated, async (req, res) => {
    res.sendFile(path.join(__dirname, "./html/home.html"));
});

app.get("/me", isAuthenticated, (req, res) => {
    try{
        const user = req.user;
        return res.status(200).json({
            success: true,
            user
        });
    }catch(error){
        return sendError(res, 500, error.message);
    }
})

app.get("/login", async (req, res) => {
    const token = req.cookies?.token;
    if(token){
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "./html/login.html"));
});
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendError(res, 400, "All fields are required");
        }
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 400, "Invalid email or password");
        }
        const isPasswordMatch = await compare(password, user.password);
        if(!isPasswordMatch){
            return sendError(res, 400, "Invalid email or password");
        }
        return sendToken(res, user, true, "Login successfully");
    }catch(error){
        return sendError(res, 500, error.message)
    }
});

app.get("/signup", async (req, res) => {
    const token = req.cookies?.token;
    if(token){
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "./html/signup.html"));
});
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return sendError(res, 400, "All fields are required");
        }
        let user = await User.findOne({ email });
        if (user) {
            return sendError(res, 400, "User already exists");
        }
        const hashPassword = await hash(password, 10);
        user = await User.create({
            name, email, password: hashPassword
        });
        return sendToken(res, user, true, "Signup successfully");
    }catch(error){
        return sendError(res, 500, error.message);
    }
});

app.post("/todo/add", isAuthenticated, async (req, res) => {
    try{
        const { title, description } = req.body;
        if(!title || !description){
            return sendError(res, 400, "All fields are required");
        }
        const user = await User.findById(req.user._id);
        await user.tasks?.unshift({
            title: title,
            desc: description,
            createdAt: new Date(Date.now())
        });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "ToDo added successfully",
            user
        });
    }catch(error){
        return sendError(res, 500, error.message)
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on : http://localhost:${process.env.PORT}`);
});