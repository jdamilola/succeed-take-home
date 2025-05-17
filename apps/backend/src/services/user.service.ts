import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

import { db } from '../db';
import { users } from '../db/schema';

import { CreateUserDto, UserInfo, UpdateUserDto, User } from '../interfaces/user.interface';
/**
 * Service for managing users
 */
export class UserService {
  /**
   * Authenticate a user
   * @returns UserInfo if authentication is successful, null otherwise
   */
  static async authenticate(email: string, password: string, schoolId: string): Promise<UserInfo | null> {
    const result = await db.select().from(users).where(
      and(
        eq(users.email, email.toLowerCase()),
        eq(users.schoolId, schoolId)
      )
    );
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Return user info without password hash
    return {
      id: user.id,
      schoolId: user.schoolId,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role
    };
  }

  /**
   * Get a user by ID
   */
  static async findById(id: string): Promise<UserInfo | null> {
    const result = await db.select({
      id: users.id,
      schoolId: users.schoolId,
      email: users.email,
      firstName: users.firstName || undefined,
      lastName: users.lastName || undefined,
      role: users.role
    }).from(users).where(eq(users.id, id));

    if (result.length === 0) {
      return null;
    }

    return this.mapUser(result[0]);
  }

  static mapUser(user: User): UserInfo {
    return {
      id: user.id,
      schoolId: user.schoolId,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role
    };
  }
}
