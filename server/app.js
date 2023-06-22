import createError from "http-errors"
import express from "express"
import cookieParser from "cookie-parser"
import logger from "morgan"


import controller from "./controller.js"
import { query } from "express-validator";

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// api 
app.get("/api/games",

  [
    query("startDate").isDate(),
    query("endDate").isDate()
  ],

  controller.showMatches
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err)
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
});

export default app;
