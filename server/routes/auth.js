import express from "express";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/user.js";

import { config } from "dotenv";
config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
      // passReqToCallback: true,
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      const userData = {
        googleId: profile.id,
        name: profile.displayName,
        avatar: profile.photos[0].value,
      };

      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await new User(userData).save();
      }

      return cb(null, user);
    }
  )
);

passport.serializeUser(function (user, done) {
  //TODO: maybe add encryption later on
  process.nextTick(() => {
    return done(null, {
      id: user?.id,
      name: user?.name,
      role: user?.role,
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

router.get("/login/federated/google", passport.authenticate("google"));
router.get("/oauth2/redirect/google", (req, res, next) => {
  return passport.authenticate("google", {
    failureRedirect: "/login",
    failureMessage: true,
    successRedirect: "/",
  })(req, res, next);
});

router.delete("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    req.session = null;
    res.clearCookie("session").status(204).send({});
  });
});

router.get("/me", async (req, res, next) => {
  if (req.isAuthenticated()) {
    const updatedUser = await User.findById(req.user.id);

    //update user in case data changed
    req.login(updatedUser, function (err) {
      if (err) return next(err);
      res.send(req.user);
    });
  } else {
    res.send(req.user);
  }
});

export default router;
