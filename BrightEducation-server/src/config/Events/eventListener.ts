import { EventEmitter } from "events";
import logger from "../../libs/logger";
import { prisma } from "../../libs/prisma";

// Define event types
export enum UserEvents {
  USER_LOGIN = "user:login",
  USER_LOGOUT = "user:logout",
  USER_CREATED = "user:created",
  USER_UPDATED = "user:updated",
}

// Create event emitter instance
class UserEventEmitter extends EventEmitter {
  private static instance: UserEventEmitter;

  private constructor() {
    super();
    this.setupEventListeners();
  }

  public static getInstance(): UserEventEmitter {
    if (!UserEventEmitter.instance) {
      UserEventEmitter.instance = new UserEventEmitter();
    }
    return UserEventEmitter.instance;
  }

  private setupEventListeners() {
    // Handle user login event
    this.on(UserEvents.USER_LOGIN, async (data: { userId: string; email: string }) => {
      try {
        logger.info(`[EVENT] User login event received for userId: ${data.userId}, email: ${data.email}`);
        
        await prisma.user.update({
          where: { id: data.userId },
          data: { lastLogin: new Date() },
        });
        
        logger.info(`[EVENT] Updated lastLogin for userId: ${data.userId}`);
      } catch (error: any) {
        logger.error(`[EVENT] Failed to update lastLogin for userId: ${data.userId}. Error: ${error.message}`);
      }
    });

    // Handle user logout event
    this.on(UserEvents.USER_LOGOUT, async (data: { userId: string; email: string }) => {
      try {
        logger.info(`[EVENT] User logout event received for userId: ${data.userId}, email: ${data.email}`);
        // Add logout logic if needed
      } catch (error: any) {
        logger.error(`[EVENT] Failed to handle logout for userId: ${data.userId}. Error: ${error.message}`);
      }
    });

    // Handle user created event
    this.on(UserEvents.USER_CREATED, async (data: { userId: string; email: string; role: string }) => {
      try {
        logger.info(`[EVENT] User created event received for userId: ${data.userId}, email: ${data.email}, role: ${data.role}`);
        // Add post-creation logic if needed
      } catch (error: any) {
        logger.error(`[EVENT] Failed to handle user created for userId: ${data.userId}. Error: ${error.message}`);
      }
    });
  }
}

// Export singleton instance
export const userEventEmitter = UserEventEmitter.getInstance();
