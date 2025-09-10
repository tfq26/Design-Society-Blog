import { User } from 'firebase/auth';

export type UserRole = 'basic' | 'author' | 'admin';

export interface AuthUser extends User {
  role: UserRole;
  isAdmin: boolean;
  emailVerified: boolean;
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signup: (email: string, password: string, username: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateUserProfile: (updates: {
    displayName?: string;
    photoFile?: File;
    email?: string;
    currentPassword?: string;
    password?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
    user?: AuthUser;
  }>;
  updateUserBanner: (file: File) => Promise<{
    success: boolean;
    error?: string;
    bannerURL?: string;
  }>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isAuthorized: () => boolean;
  isVerified: () => boolean;
  sendEmailVerification: (user?: User) => Promise<{
    success: boolean;
    error?: string;
  }>;
}
