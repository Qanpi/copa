import expressAsyncHandler from "express-async-handler";
import { isAdmin } from "./validation.js";

export const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) {
        throw new Error("Invalid credentials.");
    }
    next ? next() : null;
}) 

export const isAuthorized = expressAsyncHandler(async (req, res, next) => {
    isAuthenticated(req, res, undefined);

    if (!isAdmin(req.user)) {
        throw new Error("Unauthorized request.")
    }

    next();    
})
