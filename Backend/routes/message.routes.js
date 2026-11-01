import express from 'express'
import { verifyToken } from '../Services/verifyToken.service.js'
import { generateResponseController } from '../Controllers/message.controller.js'

const router = express.Router()


router.post('/generate' , verifyToken , generateResponseController)

export default router