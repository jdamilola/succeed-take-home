import { Request, Response } from 'express';
import logger from '@succeed/logger';

import { SchoolService } from '../services/school.service';

export class SchoolController {
  /**
   * Get all schools
   */
  static async getAll(req: Request, res: Response) {
    try {
      const schools = await SchoolService.findAll();

      return res.json({
        schools: schools.map(school => ({
          id: school.id,
          name: school.name,
          domain: school.domain,
          logoUrl: school.logoUrl
        }))
      });
    } catch (error) {
      logger.error(`Get schools error: ${error}`);
      res.status(500).json({ message: 'Failed to retrieve schools' });
    }
  }
}
