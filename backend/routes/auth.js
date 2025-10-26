import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI, // e.g. http://localhost:4000/auth/google/callback
  scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, cb) => {
  // store tokens with session for later Gmail API calls
  const user = { profile, accessToken, refreshToken };
  return cb(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

router.use(passport.initialize());
router.use(passport.session());

router.get("/google", passport.authenticate("google", { accessType: "offline", prompt: "consent" }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL || "http://localhost:3000" }),
  (req, res) => {
    // On success, redirect to frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`);
  });

router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, profile: req.user.profile });
});

router.get("/logout", (req, res) => {
  req.logout(() => {});
  req.session.destroy(() => res.redirect(process.env.FRONTEND_URL || "http://localhost:3000"));
});

export default router;
    