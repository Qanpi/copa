import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import _debugger from "debug"
const debug = _debugger("app:")

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactPath = path.resolve(__dirname, "../client/build");

import apiRouter from "./routes/api.js";
import authRouter from "./routes/auth.js";
import cookieSession from "cookie-session";
import passport from "passport";
import "dotenv/config.js"
import "./services/mongo.db.js"

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env["GOOGLE_CLIENT_SECRET"]));

app.use(
  cookieSession({
    name: "session",
    secret: process.env["GOOGLE_CLIENT_SECRET"],
    maxAge: 24 * 60 * 60 * 1000, //24 hours
  })
);

// register regenerate & save after the cookieSession middleware initialization
// workound to issue: https://github.com/jaredhanson/passport/issues/904
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

//static react
app.use(express.static(reactPath));

app.use("/api", apiRouter); // api request flow: route -> controller -> db service
app.use("/", authRouter);

//home page
app.get("/", (req, res) => {
  res.sendFile(reactPath + "/index.html");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err);
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err,
  });
});

export default app;
