import zod from "zod";
import { ROLE_TYPE } from "../../../generated/prisma/enums";
import { JwtPayload } from "jsonwebtoken";

export const loginSchema = zod.object({
  email: zod.email(),
  password: zod.string().min(8),
});

export type accPayload = {
  userId: string;
  email: string;
  role: ROLE_TYPE;
  refId: string;
};

export type refPayload = {
  userId: string;
  email: string;
  role: ROLE_TYPE;
};

export interface customPayload extends JwtPayload {
  userId: string;
  email: string;
  refId: string | null;
  role: ROLE_TYPE;
}

export type ReqUser = {
  userId: string;
  email: string;
  role: string;
  manageType?: string | null;
};
