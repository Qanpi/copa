import express from "express";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import config from "../configs/db.config.js"
import "dotenv/config.js"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "http://localhost:3001/oauth2/redirect/google",
      scope: ["profile"],
    },
    function verify(accessToken, refreshToken, profile, cb) {
        console.log(profile)

        //check i ndb
        return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log("serializing user: ", user.accessToken);
  done(null, user.accessToken);
});

passport.deserializeUser(function (accessToken, done) {
  console.log("deserializing user: "+ accessToken)
  done(null, accessToken);
});

const router = express.Router();

router.get("/login/federated/google", passport.authenticate("google"));
router.get(
  "/oauth2/redirect/google",
  passport.authenticate(
    "google",
    { failureRedirect: "/login", failureMessage: true, successReturnToOrRedirect: "/" },
  )
);

export default router;
