import { NextFunction, Request, Response } from "express";
import logger from "../../libs/logger";

export async function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(`[GLOBAL ERROR HANDLER] Structured the error.`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
  });

  const errStatus = err.statusCode || 500;
  const errMessage = err.message || "Internal Server Error";

  // Send response to client
  return res.status(errStatus).json({
    error: true,
    status: errStatus,
    message: errMessage,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
