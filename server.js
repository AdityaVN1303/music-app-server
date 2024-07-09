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
const app = express()
const port = process.env.PORT || 8000
connectCloudinary();
connectDB();

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());
app.use(cors())

// Initializing Routers
app.use('/api/song' , songRouter);
app.use("/api/album", albumRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("API Working"))

app.listen(port, () => console.log(`Server started on ${port}`))