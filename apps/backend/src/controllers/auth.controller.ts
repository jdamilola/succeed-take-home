import { Request, Response } from 'express';
import logger from '@succeed/logger';

import { generateAuthToken } from '../utils/auth';
import { SchoolService } from '../services/school.service';
import { UserService } from '../services/user.service';

export class AuthController {
  /**
   * Log in an existing user
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password, schoolId, schoolDomain } = req.body;

      // Ensure either schoolId or schoolDomain is provided
      if (!schoolId && !schoolDomain) {
        return res.status(400).json({ message: 'Either schoolId or schoolDomain is required' });
      }

      // Determine school ID from domain if not directly provided
      let school = null;
      if (!schoolId && schoolDomain) {
        school = await SchoolService.findByDomain(schoolDomain);
      } else {
        school = await SchoolService.findById(schoolId);
      }

      if (!school) {
        return res.status(404).json({ message: 'School not found with the provided domain/ID' });
      }

      // Authenticate user
      const user = await UserService.authenticate(email, password, school.id);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate authentication token
      const token = generateAuthToken(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          school: {
            id: school.id,
            name: school.name
          }
        },
        token
      });
    } catch (error) {
      logger.error(`Login error: ${error}`);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // User is already attached to the request by the authenticate middleware
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get school information
      const school = await SchoolService.findById(user.schoolId);

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school: school ? {
          id: school.id,
          name: school.name,
          domain: school.domain
        } : null
      });
    } catch (error) {
      logger.error(`Get profile error: ${error}`);
      res.status(500).json({ message: 'Failed to retrieve profile' });
    }
  }
}
