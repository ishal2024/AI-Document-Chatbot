import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from './Config/db.config.js'
connectDB()

import cookieParser from "cookie-parser"


const app = express()


app.use(express.json());
app.use(cookieParser());


import authRouter from './routes/auth.routes.js'
app.use('/auth/' , authRouter)

app.get('/' , (req,res) => {
    res.send("Hello World")
})

app.listen(3000 , () => {
    console.log("Server is listening")
})