import express from 'express'
import upload from '../Services/multer.service.js'
import { createChatController } from '../Controllers/chat.controller.js'
import { verifyToken } from '../Services/verifyToken.service.js'


const router = express.Router()

router.use(verifyToken)

router.post('/create' , upload.single("document") , createChatController)

router.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

export default router