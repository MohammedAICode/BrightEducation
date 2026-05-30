import { Router } from "express";
import { 
  login, 
  logout, 
  me, 
  forgotPasswordHandler, 
  resetPasswordRequestHandler, 
  approvePasswordResetHandler
} from "./auth.controller";
import { authenticate } from "../../config/middleware/authenticate";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);
authRouter.get("/logout", authenticate, logout);
authRouter.post("/forgot-password", forgotPasswordHandler);
authRouter.post("/reset-password-request", authenticate, resetPasswordRequestHandler);
authRouter.post("/approve-password-reset", authenticate, approvePasswordResetHandler);
