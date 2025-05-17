import { Request, Response } from 'express';
import logger from '@succeed/logger';

import { CompetitionService } from '../services/competition.service';
import { CompetitionVisibility } from '../interfaces/competition.interface';
import { canAccessCompetition } from '../utils/auth';

export class CompetitionController {
  /**
   * Create a new competition
   */
  static async create(req: Request, res: Response) {
    try {
      const { name, description, rules, visibility, startDate, endDate } = req.body;

      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Create new competition
      const newCompetition = await CompetitionService.create({
        schoolId: req.schoolId,
        name,
        description,
        rules,
        visibility: visibility as CompetitionVisibility || 'private',
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy: req.user.id
      });

      // If restricted visibility, add allowed schools
      if (visibility === 'restricted' && req.body.allowedSchools && Array.isArray(req.body.allowedSchools)) {
        const promises = [];
        for (const schoolId of req.body.allowedSchools) {
          promises.push(CompetitionService.addSchoolAccess(newCompetition.id, schoolId));
        }

        await Promise.all(promises);
      }

      res.status(201).json({
        message: 'Competition created successfully',
        competition: newCompetition
      });
    } catch (error) {
      logger.error(`Create competition error: ${error}`);
      res.status(500).json({ message: 'Failed to create competition' });
    }
  }

  /**
   * Get all accessible competitions for the current user
   */
  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const competitions = await CompetitionService.findAccessibleCompetitions(req.schoolId);

      res.json({ competitions: competitions });
    } catch (error) {
      logger.error(`Get competitions error: ${error}`);
      res.status(500).json({ message: 'Failed to retrieve competitions' });
    }
  }

  /**
   * Get a competition by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const competition = await CompetitionService.findById(id);

      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      // Check if user can access this competition
      let allowedSchools: string[] = [];
      if (competition.visibility === 'restricted') {
        allowedSchools = await CompetitionService.getSchoolAccess(id);
      }

      const canAccess = canAccessCompetition(
        competition.school.id,
        competition.visibility,
        req.schoolId,
        allowedSchools
      );

      if (!canAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Return competition details
      res.json({
        ...competition,
        allowedSchools: competition.visibility === 'restricted' ? allowedSchools : undefined
      });
    } catch (error) {
      logger.error(`Get competition error: ${error}`);
      res.status(500).json({ message: 'Failed to retrieve competition' });
    }
  }
}
