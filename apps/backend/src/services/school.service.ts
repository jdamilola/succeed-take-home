import { eq } from 'drizzle-orm';

import { db } from '../db';
import { schools } from '../db/schema';

import { School } from '../interfaces/school.interface';

/**
 * Service for managing schools (tenants)
 */
export class SchoolService {
  /**
   * Get a school by ID
   */
  static async findById(id: string): Promise<School | null> {
    const result = await db.select().from(schools).where(eq(schools.id, id));
    
    if (result.length === 0) {
      return null;
    }
    
    const school = result[0];
    return {
      id: school.id,
      name: school.name,
      domain: school.domain || undefined,
      logoUrl: school.logoUrl || undefined,
      createdAt: school.createdAt!,
      updatedAt: school.updatedAt!
    };
  }

  /**
   * Get a school by domain
   */
  static async findByDomain(domain: string): Promise<School | null> {
    const result = await db.select().from(schools).where(eq(schools.domain, domain));
    
    if (result.length === 0) {
      return null;
    }
    
    const school = result[0];
    return {
      id: school.id,
      name: school.name,
      domain: school.domain || undefined,
      logoUrl: school.logoUrl || undefined,
      createdAt: school.createdAt!,
      updatedAt: school.updatedAt!
    };
  }

  /**
   * Get all schools
   */
  static async findAll(): Promise<School[]> {
    const result = await db.select().from(schools).orderBy(schools.name);
    
    return result.map(school => ({
      id: school.id,
      name: school.name,
      domain: school.domain || undefined,
      logoUrl: school.logoUrl || undefined,
      createdAt: school.createdAt!,
      updatedAt: school.updatedAt!
    }));
  }
}
