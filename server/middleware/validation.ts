import expressAsyncHandler from "express-async-handler";
import { validationResult, body } from "express-validator"
import { Types } from "mongoose";

export const reportValidationErrors = expressAsyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        throw new Error("Validation error.", {cause: result.array()});
    }

    next();
}) 

export const isGoodName = (field) => body(field).trim().isAscii().notEmpty().escape();

export const isLoggedInAsUser = (user: Express.User, userId: string) => {
  return user.id === userId;
};
export const isAdmin = (user: Express.User) => {
  return user.role === "admin" || user.name === "Aleksei Terin";
};
const isManager = (user: Express.User, team: { manager: Types.ObjectId | string; }): boolean => {
  return team.manager.toString() === user.id;
};
export const isManagerOrAdmin = (user: Express.User, team: { manager: Types.ObjectId | string; }): boolean => {
  return isAdmin(user) || isManager(user, team);
};
