import { NextFunction, Request, Response } from "express";
import { AppError } from "../Error/AppError";
import { HTTP_STATUS } from "../Error/ErrorConstant";

export async function notFound(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    HTTP_STATUS.NOT_FOUND,
  );
  next(error);
}
