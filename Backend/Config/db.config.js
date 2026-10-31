import mongoose from "mongoose";


export async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Dtabase connected successfully")
    } catch (error) {
        console.log("DB Connection failed ",error?.message)
        process.exit(1)
    }
}