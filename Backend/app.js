import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { upload } from "./src/middlewares/multer.middleware.js";
const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(morgan('dev'))



//routes
import userRouter from "./src/routes/user.routes.js"



//routes decleration
app.use("/api/v1/users",userRouter);



export {app};