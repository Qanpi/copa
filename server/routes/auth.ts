import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import User, { TUser } from "../models/user.js";

import { config } from "dotenv";
import mongoose from "mongoose";
config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
      // passReqToCallback: true,
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      const userData = {
        googleId: profile.id,
        name: profile.displayName,
        avatar: profile.photos?.[0].value,
        role: (process.env.NODE_ENV === "development" && profile.displayName === "qanpi") ? "admin" : undefined,
      };


      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await new User(userData).save();
      }

      return cb(null, {
        ...user.toObject() as TUser,
        team: user.team?.id
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  //TODO: maybe add encryption later on
  const serialized: Express.User = {
    id: user?.id,
    name: user?.name,
    team: user?.team,
    role: user?.role,
  };

  process.nextTick(() => {
    return done(null, serialized);
  });
});

passport.deserializeUser(function (user: Express.User, done) {
  //TODO: maybe hit the db here?
  //TODO: maybe add common info to cookie
  process.nextTick(() => {
    return done(null, user);
  });
});

const router = express.Router();

//for testing
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  passport.use(new LocalStrategy({
  },
    async function (username: string, password: string, done) {
      if (!username) return done(new Error("no username"), false);

      let user = await User.findOne({ name: username });
      if (!user)
        user = await User.create({ name: username, role: username === "admin" ? username : undefined })

      return done(null, {
        ...user.toObject() as TUser,
        team: user.team?.id
      });
    }
  ))

  router.post("/login/tests", passport.authenticate("local", { failureRedirect: "/login/tests" }),
    function (req, res) {
      res.send(req.user);
    })

  router.delete("/", async (req, res) => {
    await mongoose.connection.dropDatabase();
    res.status(204).send({})
  })
}

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
    let user = await User.findById(req.user.id);

    //create a user if the session is valid but one isn't in db
    //this is useful for postman tests
    if (!user) user = await User.create(req.user);

    //pull out any sensitive fields
    const {googleId, ...sanitized} = user.toObject();

    //update user in case data changed
    req.login({ ...user.toObject() as TUser, team: user.team?.id }, function (err) {
      if (err) return next(err);
      res.send(sanitized);
    });
  } else {
    res.send(req.user);
  }
});

export default router;
