import expressAsyncHandler from "express-async-handler";
import { validationResult, body } from "express-validator"
import { Types, isValidObjectId } from "mongoose";

export const reportValidationErrors = expressAsyncHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new Error("Validation error.", {cause: result.array()});
  }

  next();
})

export const isLoggedInAsUser = (user: Express.User | undefined, userId: string) => {
  return !!user && user.id === userId;
};
export const isAdmin = (user: Express.User | undefined) => {
  return !!user && user.role === "admin";
};
export const isManager = (user: Express.User | undefined, managerId?: string): boolean => {
  return !!user && managerId?.toString() === user.id;
};
export const isManagerOrAdmin = (user: Express.User | undefined, managerId?: string): boolean => {
  return !!user && (isAdmin(user) || isManager(user, managerId));
};

export const isInTeam = (user: Express.User | undefined, teamId: string) => {
  return !!user && user?.team === teamId;
}