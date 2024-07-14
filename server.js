import express from "express"
import cors from 'cors'
import connectCloudinary from "./config/cloudinary.js";
import 'dotenv/config'
import connectDB from "./config/connectDb.js";
import songRouter from "./routes/songRoute.js";
import albumRouter from "./routes/albumRoute.js";
import userRouter from "./routes/userRoute.js"
import cookieParser from "cookie-parser";

// app config
const app = express();
app.use(cors({credentials : true , origin : 'http://localhost:3000'}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
connectCloudinary();
connectDB();

// middlewares

app.use(express.urlencoded({extended : false}));

// Initializing Routers
app.use('/api/song' , songRouter);
app.use("/api/album", albumRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("API Working"))

app.listen(5000, () => console.log(`Server started on ${5000}`))