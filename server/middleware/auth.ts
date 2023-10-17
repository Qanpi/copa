import expressAsyncHandler from "express-async-handler";
import { StatusError, isAdmin } from "./validation.js";

export const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) {
        throw new StatusError("Invalid credentials.", 401);
    }
   next(); 
}) 

export const isAuthorized = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) {
        throw new StatusError("Invalid credentials.", 401);
    }

    if (!isAdmin(req.user)) {
        throw new StatusError("Unauthorized request.", 403)
    }

    next();    
})
