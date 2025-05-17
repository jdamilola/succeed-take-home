import { Request, Response, NextFunction } from 'express';
import logger from '@succeed/logger';

import { UserService } from '../services/user.service';
import { extractTokenFromHeader, verifyAuthToken, isAdmin } from '../utils/auth';
/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify and decode the token
    const payload = verifyAuthToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Retrieve user from database to ensure they still exist
    const user = await UserService.findById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Ensure the user belongs to the claimed school
    if (user.schoolId !== payload.schoolId) {
      return res.status(403).json({ message: 'Invalid school association' });
    }
    
    // Attach user and school information to the request object
    req.user = user;
    req.schoolId = user.schoolId;
    
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
};

/**
 * Middleware to ensure tenant isolation for school-specific resources
 */
export const enforceTenantIsolation = (resourceSchoolIdGetter: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.schoolId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get the school ID of the requested resource
    const resourceSchoolId = resourceSchoolIdGetter(req);
    
    // Skip isolation check if resource doesn't have a school ID yet
    if (!resourceSchoolId) {
      return next();
    }
    
    // Allow admin users to access resources across schools (optional)
    // if (isAdmin(req.user)) {
    //   return next();
    // }
    
    // Check that the user is accessing a resource belonging to their school
    if (resourceSchoolId !== req.schoolId) {
      return res.status(403).json({ message: 'Access denied to resources from other schools' });
    }
    
    next();
  };
};
