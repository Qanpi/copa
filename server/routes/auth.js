import express from "express";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import "dotenv/config.js";
import User from "../models/user.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "http://localhost:3001/oauth2/redirect/google",
      scope: ["profile"],
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      const userData = {
        googleId: profile.id,
        name: profile.displayName,
        avatar: profile.photos[0].value,
      };

      let user = await User.findOne({ googleId: profile.id }).populate("team");
      if (!user) {
        user = await new User(userData).save();
      }

      return cb(null, user);
    }
  )
);

passport.serializeUser(function (user, done) {
  //TODO: maybe add encryption later on
  //FIXME: maybe bad to serialize everything
  process.nextTick(() => {
    return done(null, {
      id: user.id,
    });
  });
});

passport.deserializeUser(function (user, done) {
  //TODO: maybe add common info to cookie
  process.nextTick(() => {
    return done(null, user);
  });
});

const router = express.Router();

const LOCALHOST_SERVER_URL = "http://localhost:3000";

router.get("/login/federated/google", passport.authenticate("google"));
router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureMessage: true,
    successRedirect: LOCALHOST_SERVER_URL,
  })
);

//TODO: refactor to controllers?
router.post("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect(LOCALHOST_SERVER_URL);
  });
});

router.get("/me", async (req, res, next) => {
  if (req.isAuthenticated()) {
    const updatedUser = await User.findById(req.user.id);

    //skips serialization and assigns directly to req.user
    req.login(updatedUser, function(err) {
      if (err) return next(err);
      res.send(req.user);
    })
  } else {
  res.send(req.user);
  }
});

export default router;
