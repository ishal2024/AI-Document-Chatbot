import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { authGoogleController, getUserInfoController, googleCallbackController, logoutController } from '../Controllers/auth.controller.js'
import { verifyToken } from '../Services/verifyToken.service.js'
import session from 'express-session'

const router = express.Router()

router.use(session({
    name: "oauth.state",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 10 * 60 * 1000, 
    },
  }))

router.get('/google' , authGoogleController)

router.get('/google/callback'  , googleCallbackController)

router.get("/me", verifyToken , getUserInfoController);

router.get("/logout", logoutController);


router.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

export default router