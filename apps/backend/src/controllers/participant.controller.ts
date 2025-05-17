import { Request, Response } from 'express';

import logger from '@succeed/logger';

import { canAccessCompetition } from '../utils/auth';
import { CompetitionService } from '../services/competition.service';
import { CompetitionParticipantService } from '../services/competition-participant.service';

export class ParticipantController {
  /**
   * Join a competition
   */
  static async join(req: Request, res: Response) {
    try {
      const { competitionId } = req.body;
      
      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if competition exists
      const competition = await CompetitionService.findById(competitionId);
      
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      
      // Check if user can access this competition
      let allowedSchools: string[] = [];
      if (competition.visibility === 'restricted') {
        allowedSchools = await CompetitionService.getSchoolAccess(competitionId);
      }
      
      const canAccess = canAccessCompetition(
        competition.school.id,
        competition.visibility,
        req.schoolId,
        allowedSchools
      );
      
      if (!canAccess) {
        return res.status(403).json({ message: 'Access denied to this competition' });
      }
      
      // Check if already participating
      const isParticipating = await CompetitionParticipantService.isParticipating(competitionId, req.user.id);
      
      if (isParticipating) {
        return res.status(409).json({ message: 'Already participating in this competition' });
      }
      
      // Join competition
      const participant = await CompetitionParticipantService.create({
        competitionId: competitionId,
        userId: req.user.id,
        schoolId: req.schoolId
      });
      
      if (!participant) {
        return res.status(500).json({ message: 'Failed to join competition' });
      }
      
      res.status(201).json({
        message: 'Successfully joined competition',
        participant: {
          id: participant.id,
          competitionId: participant.competition.id,
          userId: participant.user.id,
          schoolId: participant.school.id,
          joinedAt: participant.joinedAt
        }
      });
    } catch (error) {
      logger.error(`Join competition error: ${error}`);
      res.status(500).json({ message: 'Failed to join competition' });
    }
  }

  /**
   * Leave a competition
   */
  static async leave(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      
      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if competition exists
      const competition = await CompetitionService.findById(competitionId);
      
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      
      // Check if participating
      const isParticipating = await CompetitionParticipantService.isParticipating(competitionId, req.user.id);
      
      if (!isParticipating) {
        return res.status(404).json({ message: 'Not participating in this competition' });
      }
      
      // Leave competition
      const left = await CompetitionParticipantService.delete(competitionId, req.user.id, req.schoolId);
      if (!left) {
        return res.status(500).json({ message: 'Failed to leave competition' });
      }
      
      res.json({ message: 'Successfully left competition' });
    } catch (error) {
      logger.error(`Leave competition error: ${error}`);
      res.status(500).json({ message: 'Failed to leave competition' });
    }
  }

  /**
   * Get all participants for a competition
   */
  static async getParticipants(req: Request, res: Response) {
    try {
      const { competitionId } = req.params;
      
      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if competition exists
      const competition = await CompetitionService.findById(competitionId);
      
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      
      // Check if user can access this competition
      let allowedSchools: string[] = [];
      if (competition.visibility === 'restricted') {
        allowedSchools = await CompetitionService.getSchoolAccess(competitionId);
      }
      
      const canAccess = canAccessCompetition(
        competition.school.id,
        competition.visibility,
        req.schoolId,
        allowedSchools
      );
      
      if (!canAccess) {
        return res.status(403).json({ message: 'Access denied to this competition' });
      }
      
      // Get participants
      const participants = await CompetitionParticipantService.findByCompetition(competitionId);
      res.json({
        competitionId,
        participants
      });
    } catch (error) {
      logger.error(`Get participants error: ${error}`);
      res.status(500).json({ message: 'Failed to retrieve participants' });
    }
  }

  /**
   * Get competitions a user is participating in
   */
  static async getUserCompetitions(req: Request, res: Response) {
    try {
      if (!req.user || !req.schoolId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Get competition IDs
      const participants = await CompetitionParticipantService.findByUser(req.user.id, req.schoolId);
      
      // Get competition details
      const promises = [];
      for (const participant of participants) {
        promises.push(CompetitionService.findById(participant.competition.id));
      }

      const competitions = await Promise.all(promises);
      res.json({
        competitions: competitions.length > 0 ? competitions : []
      });
    } catch (error) {
      logger.error(`Get user competitions error: ${error}`);
      res.status(500).json({ message: 'Failed to retrieve competitions' });
    }
  }
}
