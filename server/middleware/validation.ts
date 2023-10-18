import expressAsyncHandler from "express-async-handler";
import { validationResult, body } from "express-validator"
import { Types, isValidObjectId } from "mongoose";

export const reportValidationErrors = expressAsyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        throw new Error("Validation error.");
    }

    next();
}) 

export const isGoodName = (field) => body(field).trim().isAscii().notEmpty().escape();

export const isLoggedInAsUser = (user: Express.User, userId: string) => {
  return user?.id === userId;
};
export const isAdmin = (user?: Express.User) => {
  return user?.role === "admin";
};
export const isManager = (user: Express.User, managerId: Types.ObjectId | string): boolean => {
  return managerId.toString() === user?.id;
};
export const isManagerOrAdmin = (user: Express.User, managerId: Types.ObjectId | string): boolean => {
  return isAdmin(user) || isManager(user, managerId);
};

export const isInTeam = (user: Express.User, teamId: Types.ObjectId | string) => {
  return user.team.id === teamId;
}

export const validateObjectIdInBody = (fieldName: string) => {
  return body(fieldName).custom(value => {
    return isValidObjectId(value)
  })
}