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
  return !!user?.id && user.id === userId;
};
export const isAdmin = (user: Express.User | undefined) => {
  return !!user?.id && user.role === "admin";
};
export const isManager = (user: Express.User | undefined, managerId: string): boolean => {
  return !!user?.id && managerId === user.id;
};
export const isManagerOrAdmin = (user: Express.User | undefined, managerId: string): boolean => {
  return !!user?.id && (isAdmin(user) || isManager(user, managerId));
};

export const isInTeam = (user: Express.User | undefined, teamId: string) => {
  return !!user?.id && user?.team === teamId;
}