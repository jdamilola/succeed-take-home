import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { competitionParticipants, competitions, schools, users } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

import { CompetitionParticipant, CreateParticipantDto } from '../interfaces/competition.interface';
import { UserService } from './user.service';
import { SchoolService } from './school.service';
import { CompetitionService } from './competition.service';

/**
 * Service for managing competition participants
 */
export class CompetitionParticipantService {
  /**
   * Add a participant to a competition
   */
  static async create(participantData: CreateParticipantDto): Promise<CompetitionParticipant> {
    const id = uuidv4();

    const [school, user, competition] = await Promise.all([
      SchoolService.findById(participantData.schoolId),
      UserService.findById(participantData.userId),
      CompetitionService.findById(participantData.competitionId)
    ]);

    if (!school || !user || !competition) {
      throw new Error('School, user, or competition not found');
    }
    
    const [newParticipant] = await db.insert(competitionParticipants).values({
      id,
      competitionId: participantData.competitionId,
      userId: participantData.userId,
      schoolId: participantData.schoolId
    }).returning({
      id: competitionParticipants.id,
      competitionId: competitionParticipants.competitionId,
      userId: competitionParticipants.userId,
      schoolId: competitionParticipants.schoolId,
      joinedAt: competitionParticipants.joinedAt,
    });
    
    return {
      id: newParticipant.id,
      joinedAt: newParticipant.joinedAt!,
      school: {
        id: school.id,
        name: school.name
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      competition: {
        id: competition.id,
        name: competition.name
      }
    };
  }

  /**
   * Check if a user is already participating in a competition
   */
  static async isParticipating(competitionId: string, userId: string): Promise<boolean> {
    const result = await db.select({ id: competitionParticipants.id })
      .from(competitionParticipants)
      .where(
        and(
          eq(competitionParticipants.competitionId, competitionId),
          eq(competitionParticipants.userId, userId)
        )
      );
    
    return result.length > 0;
  }

  /**
   * Get all participants for a competition
   */
  static async findByCompetition(competitionId: string): Promise<CompetitionParticipant[]> {
    const result = await db.select()
      .from(competitionParticipants)
      .innerJoin(schools, eq(competitionParticipants.schoolId, schools.id))
      .innerJoin(users, eq(competitionParticipants.userId, users.id))
      .innerJoin(competitions, eq(competitionParticipants.competitionId, competitions.id))
      .where(eq(competitionParticipants.competitionId, competitionId));

    
    return result.map(({ schools, users, competitions, competition_participants }) => ({
      id: competition_participants.id,
      competitionId: competition_participants.competitionId,
      userId: competition_participants.userId,
      schoolId: competition_participants.schoolId,
      joinedAt: competition_participants.joinedAt!,
      school: {
        id: schools.id,
        name: schools.name
      },
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName ?? undefined,
        lastName: users.lastName ?? undefined
      },
      competition: {
        id: competitions.id,
        name: competitions.name
      }
    }));
  }

  /**
   * Get all competitions a user is participating in
   */
  static async findByUser(userId: string, schoolId: string): Promise<CompetitionParticipant[]> {
    const result = await db.select()
      .from(competitionParticipants)
      .innerJoin(schools, eq(competitionParticipants.schoolId, schools.id))
      .innerJoin(users, eq(competitionParticipants.userId, users.id))
      .innerJoin(competitions, eq(competitionParticipants.competitionId, competitions.id))
      .where(
        and(
          eq(competitionParticipants.userId, userId),
          eq(competitionParticipants.schoolId, schoolId)
        )
      );
    
    return result.map(({ schools, users, competitions, competition_participants }) => ({
      id: competition_participants.id,
      competitionId: competition_participants.competitionId,
      userId: competition_participants.userId,
      schoolId: competition_participants.schoolId,
      joinedAt: competition_participants.joinedAt!,
      school: {
        id: schools.id,
        name: schools.name
      },
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName ?? undefined,
        lastName: users.lastName ?? undefined
      },
      competition: {
        id: competitions.id,
        name: competitions.name
      }
    }));
  }

  /**
   * Remove a participant from a competition
   */
  static async delete(competitionId: string, userId: string, schoolId: string): Promise<boolean> {
    const result = await db.delete(competitionParticipants)
      .where(
        and(
          eq(competitionParticipants.competitionId, competitionId),
          eq(competitionParticipants.userId, userId),
          eq(competitionParticipants.schoolId, schoolId)
        )
      )
      .returning({ id: competitionParticipants.id });
    
    return result.length > 0;
  }
} 