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
        //check i ndb
        return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  //maybe add encryption later on
  process.nextTick(() => {
    return done(null, {
      id: user.id,
      name: user.displayName,
    })
  })
});

passport.deserializeUser(function (user, done) {
  process.nextTick(() => {
    console.log(user)
    return done(null, user);
  })
});

const router = express.Router();

const LOCALHOST_SERVER_URL = "http://localhost:3000"

router.get("/login/federated/google", passport.authenticate("google"));
router.get(
  "/oauth2/redirect/google",
  passport.authenticate(
    "google",
    { failureRedirect: "/login", failureMessage: true, successRedirect: LOCALHOST_SERVER_URL },
  )
);


router.post("/logout", (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect(LOCALHOST_SERVER_URL);
  }); //use post request
})

router.get("/me", (req, res) => {
  res.send(req.user);
})

export default router;
