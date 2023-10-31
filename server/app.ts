import cookieParser from "cookie-parser";
import "dotenv/config.js";
import express, { NextFunction, Request, Response } from "express";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import cookieSession from "cookie-session";
import expressAsyncHandler from "express-async-handler";
import passport from "passport";
import apiRouter from "./routes/api.js";
import authRouter from "./routes/auth.js";
import { debugHTTP } from "./services/debuggers.js";

const app = express();

//configure rate limiter with azure load balance
app.set('trust proxy', 1);
app.get("/ip", (req, res) => res.send(req.ip));
app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']))


//only log in dev because azure provides transaction logs by default
if (app.get("env") !== "production") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.GOOGLE_CLIENT_SECRET));

app.use(
  cookieSession({
    name: "session",
    secret: process.env.GOOGLE_CLIENT_SECRET,
    maxAge: 24 * 60 * 60 * 1000 * 30, // 1 month
  })
);

// register regenerate & save after the cookieSession middleware initialization
// workound to issue: https://github.com/jaredhanson/passport/issues/904
app.use(function (req, res, next) {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb: any) => {
      cb();
    };
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb: any) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// app.use(cors({
//   origin: "http://127.0.0.1:3000",
//   credentials: true,
// }))

//static react
//TODO: move up to avoid user deserialization?
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const reactPath = path.resolve(__dirname, "build");
app.use(express.static(reactPath));

app.use("/api", apiRouter); // api request flow: route -> controller -> db service
app.use(authRouter);

//home page
app.use(expressAsyncHandler(async (req, res) => {
  //FIXME:!redirect to localhost if developing
  if (process.env.NODE_ENV === "development") {
    return res.redirect(process.env.REACT_LOCALHOST_DOMAIN! + req.url);
  }

  res.sendFile(reactPath + "/index.html");
}));

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  debugHTTP(err.message, err.cause);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err.cause,
  });
});

export default app;
