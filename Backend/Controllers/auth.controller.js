import crypto from "crypto"
import jwt from "jsonwebtoken"
import User from "../Models/user.model.js"


const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token";

const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";



// Step 1: Redirect the user to Google.
export function authGoogleController(req,res,next){
  try {
    const state = crypto.randomBytes(32).toString("hex");
    req.session.oauthState = state;
  
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      state,
    });
  
    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
    
  } catch (error) {
    console.log(error?.message)
    next(error)
  }
}

export async function googleCallbackController(req,res,next){
    try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_denied`
      );
    }

    // Validate OAuth state to prevent forged callbacks.
    if (
      !state ||
      !req.session.oauthState ||
      typeof state !== "string" ||
      state !== req.session.oauthState
    ) {
      return res.status(403).send("Invalid OAuth state");
    }

    delete req.session.oauthState;

    if (typeof code !== "string" || !code) {
      return res.status(400).send("Missing authorization code");
    }

    // Step 3: Exchange the authorization code for tokens.
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      console.error("Google token exchange failed");
      return res.status(401).send("Google authentication failed");
    }

    // Step 4: Retrieve the authenticated Google user's profile.
    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    if (
      !profileResponse.ok ||
      !profile.sub ||
      !profile.email ||
      profile.email_verified !== true
    ) {
      return res.status(401).send("Unable to verify Google account");
    }

    // Step 5: Find or create your application's user.
    const email = profile.email.toLowerCase();

    let user = await User.findOne({ googleId: profile.sub });

    if (!user) {
      user = await User.create({
        googleId: profile.sub,
        name: profile.name || "Google User",
        email,
        profilePicture: profile.picture || null,
      });
    }

    // Step 6: Create YOUR application's JWT.
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Step 7: Establish your own login cookie.
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}`
    );
  } catch (error) {
    next(error);
  }
}

export async function getUserInfoController(req,res,next){
  try {
    const user = await User.findById(req.userId).select(
      "name email profilePicture"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(req,res){
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Logged out successfully" });
}





