import expressAsyncHandler from "express-async-handler";
import { isAdmin } from "./validation.js";

export const isAuthMiddleware = expressAsyncHandler(async (req, res, next) => {
    if (req.isUnauthenticated()) {
        throw new StatusError("Invalid credentials.", 401);
    }
   next(); 
}) 

export const isAuthorizedMiddleware = expressAsyncHandler(async (req, res, next) => {
    //code duplication with above, but i didn't wanna hack a solution togetehr
    if (req.isUnauthenticated()) {
        throw new StatusError("Invalid credentials.", 401);
    }

    if (!isAdmin(req.user)) {
        throw new StatusError("Unauthorized request.", 403)
    }

    next();    
})

class StatusError extends Error {
    status: number | undefined;
    
    constructor(message?: string, status?: number, options?: ErrorOptions) {
        super(message, options);

        this.status = status;
    }
}
