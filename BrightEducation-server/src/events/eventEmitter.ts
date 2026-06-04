import { EventEmitter } from 'events';
import logger from '../libs/logger';

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Increase if needed
  }
}

export const eventEmitter = new AppEventEmitter();

// Event types
export enum Events {
  STUDENT_ENROLLED = 'student.enrolled',
  STUDENT_UNENROLLED = 'student.unenrolled',
  STUDENT_STATUS_UPDATED = 'student.status.updated',
  PROFILE_UPDATED = 'profile.updated',
}

// Event payload interfaces
export interface StudentEnrolledPayload {
  userId: string;
  studentId: string;
  enrollmentId: string;
  rollNumber: string;
  sectionTenureId: string;
  academicYearId: string;
  className: string;
  sectionName: string;
}

export interface StudentUnenrolledPayload {
  userId: string;
  studentId: string;
  enrollmentId: string;
  status: 'PAUSED' | 'WRONG_ENTRY' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT';
}

// Helper to emit events with error handling
export function emitEvent<T>(event: Events, payload: T): void {
  try {
    eventEmitter.emit(event, payload);
    logger.info(`[EVENT] Emitted: ${event}`, { payload });
  } catch (error: any) {
    logger.error(`[EVENT] Failed to emit ${event}: ${error.message}`);
  }
}
