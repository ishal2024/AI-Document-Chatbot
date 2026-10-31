import express from 'express'
import { authGoogleController, configureOAuthSession, getUserInfoController, googleCallbackController, logoutController } from '../Controllers/auth.controller.js'
import { verifyToken } from '../Services/verifyToken.service.js'

const router = express.Router()

router.get('google' , configureOAuthSession , authGoogleController)

router.get('google/callback' , configureOAuthSession , googleCallbackController)

router.get("me", verifyToken , getUserInfoController);

router.get("logout", logoutController);


app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

export default router