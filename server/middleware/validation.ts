import expressAsyncHandler from "express-async-handler";
import { validationResult, body } from "express-validator"

export const reportValidationErrors = expressAsyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        throw new Error("Validation error.", {cause: result.array()});
    }

    next();
}) 

export const isGoodName = (field) => body(field).trim().isAscii().notEmpty().escape();