import { and, eq, inArray, or, SQL } from 'drizzle-orm';
import { db } from '../db';
import { competitions, competitionAccess, schools } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

import { Competition, CreateCompetitionDto, UpdateCompetitionDto } from '../interfaces/competition.interface';

/**
 * Service for managing competitions
 */
export class CompetitionService {
  /**
   * Create a new competition
   */
  static async create(competitionData: CreateCompetitionDto): Promise<Competition> {
    const id = uuidv4();

    const school = await db
      .select({ id: schools.id, name: schools.name })
      .from(schools)
      .where(eq(schools.id, competitionData.schoolId));

    if (school.length === 0) {
      throw new Error('School not found');
    }

    const { id: schoolId, name: schoolName } = school[0];
    
    const [newCompetition] = await db.insert(competitions).values({
      id,
      schoolId,
      name: competitionData.name,
      description: competitionData.description || null,
      rules: competitionData.rules || null,
      visibility: competitionData.visibility || 'private',
      startDate: competitionData.startDate || null,
      endDate: competitionData.endDate || null,
      createdBy: competitionData.createdBy
    }).returning();
    
    return {
      id: newCompetition.id,
      name: newCompetition.name,
      description: newCompetition.description || undefined,
      rules: newCompetition.rules || undefined,
      visibility: newCompetition.visibility,
      startDate: newCompetition.startDate || undefined,
      endDate: newCompetition.endDate || undefined,
      createdBy: newCompetition.createdBy,
      createdAt: newCompetition.createdAt!,
      updatedAt: newCompetition.updatedAt!,
      school: {
        id: schoolId,
        name: schoolName,
      }
    };
  }

  /**
   * Get a competition by ID
   */
  static async findById(id: string, schoolId?: string): Promise<Competition | null> {
    const filters: SQL[] = [
      eq(competitions.id, id)
    ];
    
    // If schoolId is provided, filter by it for tenant isolation
    if (schoolId) {
      filters.push(eq(competitions.schoolId, schoolId));
    }

    const results = await db
      .select()
      .from(competitions)
      .innerJoin(schools, eq(competitions.schoolId, schools.id))
      .where(and(...filters));

    if (results.length === 0) {
      return null;
    }
    
    const competition = results[0].competitions;
    const school = results[0].schools;
    return {
      id: competition.id,
      name: competition.name,
      description: competition.description || '',
      rules: competition.rules || '',
      visibility: competition.visibility,
      startDate: competition.startDate || undefined,
      endDate: competition.endDate || undefined,
      createdBy: competition.createdBy,
      createdAt: competition.createdAt!,
      updatedAt: competition.updatedAt!,
      school: {
        id: school.id,
        name: school.name,
      }
    };
  }

  /**
   * Find competitions accessible to a specific school
   * This includes:
   * 1. Public competitions
   * 2. Competitions owned by the school
   * 3. Restricted competitions that the school has access to
   */
  static async findAccessibleCompetitions(schoolId: string): Promise<Competition[]> {
    // Find IDs of competitions the school has access to through access list
    const accessEntries = await db.select({
      competitionId: competitionAccess.competitionId
    })
      .from(competitionAccess)
      .where(eq(competitionAccess.schoolId, schoolId));
    
    const accessIds = accessEntries.map(entry => entry.competitionId);
    
    // Build conditions for query
    const conditions: (SQL | undefined)[] = [
      eq(competitions.visibility, 'public'),
      eq(competitions.schoolId, schoolId)
    ];
    
    // Only add the restricted competition condition if we have access IDs
    if (accessIds.length > 0) {
      conditions.push(
        and(
          eq(competitions.visibility, 'restricted'),
          inArray(competitions.id, accessIds)
        )
      );
    }
    
    // Execute query with OR conditions
    const result = await db.select()
      .from(competitions)
      .innerJoin(schools, eq(competitions.schoolId, schools.id))
      .where(or(...conditions))
      .orderBy(competitions.name);
    
    return result.map(({ competitions, schools }) => ({
      id: competitions.id,
      schoolId: competitions.schoolId,
      name: competitions.name,
      description: competitions.description || '',
      rules: competitions.rules || '',
      visibility: competitions.visibility,
      startDate: competitions.startDate || undefined,
      endDate: competitions.endDate || undefined,
      createdBy: competitions.createdBy,
      createdAt: competitions.createdAt!,
      updatedAt: competitions.updatedAt!,
      school: {
        id: schools.id,
        name: schools.name,
      }
    }));
  }

  /**
   * Add a school to the access list for a restricted competition
   */
  static async addSchoolAccess(competitionId: string, schoolId: string): Promise<boolean> {
    // First, check if the competition is restricted
    const competition = await this.findById(competitionId);
    
    if (!competition || competition.visibility !== 'restricted') {
      return false;
    }
    
    try {
      await db.insert(competitionAccess)
        .values({
          competitionId,
          schoolId
        })
        .onConflictDoNothing({ target: [competitionAccess.competitionId, competitionAccess.schoolId] });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of schools that have access to a restricted competition
   */
  static async getSchoolAccess(competitionId: string): Promise<string[]> {
    const result = await db.select({ schoolId: competitionAccess.schoolId })
      .from(competitionAccess)
      .where(eq(competitionAccess.competitionId, competitionId));
    
    return result.map(row => row.schoolId);
  }
}
