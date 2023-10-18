import expressAsyncHandler from "express-async-handler";
import { isAdmin } from "./validation.js";

export const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) {
        throw new Error("Invalid credentials.");
    }
   next(); 
}) 

export const isAuthorized = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) {
        throw new Error("Invalid credentials.");
    }

    if (!isAdmin(req.user)) {
        throw new Error("Unauthorized request.")
    }

    next();    
})
