import { ReqUser } from "../../modules/Auth/auth.schema";

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}