export const HTTP_STATUS = {
  // success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // server errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const COMMON_ERROR_MESSAGES = {
  ENV_MISSING: "Missing evnvironmental(s) details.",
  FEILD_MISSING: "Unable to access a feild in the application.",
};

export const USER_ERROR_MESSAGES = {
  USER_NOT_FOUND: "User(s) not found.",
  USER_INCOMPLETE: "User(s) is not active (or) present in in-active status",
  USER_PASSWORD_INCORRECT: "User(s) password is incorrect.",
  USER_INVALID_PERMISSION:
    "User(s) does not have the valid permission to register the user.",
    USER_NOT_ACITVE: "User(s) does not present in the active state.",

  USER_CREATE_INVALID: "User(s) contain incomplete or invalid fields.",
};

export const SEED_ERROR_MESSAGES = {
  FAILED_SEED: "Failed to seed the admin",
};

// export const AUTH_ERROR_MESSAGES = {
//   FEILD_MISSING: "Unable to access a feild in the application.",
// };
