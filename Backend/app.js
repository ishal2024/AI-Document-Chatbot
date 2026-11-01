import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { connectDB } from './Config/db.config.js'
connectDB()

import cookieParser from "cookie-parser"


const app = express()


app.use(express.json());
app.use(cookieParser());


import authRouter from './routes/auth.routes.js'
import chatRouter from './routes/chat.routes.js'
import messageRouter from './routes/message.routes.js'

app.use('/auth' , authRouter)
app.use('/chat' , chatRouter)
app.use('/message' , messageRouter)

app.get('/' , async (req,res) => {
    res.send("Hello World")
})

app.listen(3000 , () => {
    console.log("Server is listening")
})