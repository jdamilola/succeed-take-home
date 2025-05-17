import jwt from 'jsonwebtoken';

import { UserInfo } from '../interfaces/user.interface';

// Extend the Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
      schoolId?: string;
    }
  }
}

export interface AuthTokenPayload {
  userId: string;
  schoolId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for authentication
 */
export const generateAuthToken = (user: UserInfo): string => {
  const payload: AuthTokenPayload = {
    userId: user.id,
    schoolId: user.schoolId,
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'default-jwt-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify and decode a JWT token
 */
export const verifyAuthToken = (token: string): AuthTokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'default-jwt-secret';
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract the JWT token from the Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Checks if the user has admin role
 */
export const isAdmin = (user: UserInfo): boolean => {
  return user.role === 'admin';
};

/**
 * Checks if a user can access a competition based on its visibility and the user's school
 */
export const canAccessCompetition = (
  competitionSchoolId: string,
  visibility: string,
  userSchoolId: string,
  allowedSchools: string[] = []
): boolean => {
  // Users can always access competitions from their own school
  if (competitionSchoolId === userSchoolId) {
    return true;
  }

  // Public competitions are accessible by all users
  if (visibility === 'public') {
    return true;
  }

  // Private competitions are only accessible by users from the same school
  if (visibility === 'private') {
    return false;
  }

  // Restricted competitions are accessible by users from schools in the allowed list
  if (visibility === 'restricted') {
    return allowedSchools.includes(userSchoolId);
  }

  return false;
}; 