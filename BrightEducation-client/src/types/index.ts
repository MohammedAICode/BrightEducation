export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGEMENT' | 'TEACHER' | 'STUDENT' | 'STAFF';
  manageType?: 'ACCOUNTS' | 'CLASS_TEACHER' | 'INCHARGE';
  firstname?: string;
  lastname?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  emergencyContact?: string;
  emergencyContactRelation?: string;
  parentName?: string;
  parentPhone?: string;
  parentOccupation?: string;
  parentRelation?: string;
  isActive?: string;
  lastLogin?: string;
  profileImg?: string;
  profileImgKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitializing?: boolean;
}

export type UserRole = 'ADMIN' | 'MANAGEMENT' | 'TEACHER' | 'STUDENT' | 'STAFF';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
