import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 30 * 60 * 1000,
};

export const COOKIE_NAMES = {
  REFRESH_TOKEN: "bright_rt",
  ACCESS_TOKEN: "bright_at",
} as const;
