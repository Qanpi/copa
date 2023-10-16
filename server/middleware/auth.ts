import expressAsyncHandler from "express-async-handler";

export const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) throw new Error("Invalid credentials.");
    next();
}) 

export const isAdmin = expressAsyncHandler(async (req, res, next) => {
    if (req.user.role !== "admin") throw new Error("Unauthorized request.")
    next();    
})
