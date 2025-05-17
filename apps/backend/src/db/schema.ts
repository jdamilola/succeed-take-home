import { pgTable, uuid, varchar, text, timestamp, unique, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum definitions
export const userRoleEnum = pgEnum('user_role', ['admin', 'student']);
export const competitionVisibilityEnum = pgEnum('competition_visibility', ['public', 'private', 'restricted']);

// Schools (Tenants) Table
export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }).unique(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Users Table (with tenant isolation)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: userRoleEnum('role').notNull().default('student'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    emailSchoolUnique: unique().on(table.email, table.schoolId)
  };
});

// Competitions Table
export const competitions = pgTable('competitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  rules: text('rules'),
  visibility: competitionVisibilityEnum('visibility').notNull().default('private'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Table for restricted competitions (which schools can access)
export const competitionAccess = pgTable('competition_access', {
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => {
  return {
    pk: unique().on(table.competitionId, table.schoolId)
  };
});

// Competition Participation Table
export const competitionParticipants = pgTable('competition_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow()
}, (table) => {
  return {
    competitionUserUnique: unique().on(table.competitionId, table.userId)
  };
});

// Relations
export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  competitions: many(competitions),
  competitionAccess: many(competitionAccess)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id]
  }),
  competitions: many(competitions),
  participations: many(competitionParticipants),
}));

export const competitionsRelations = relations(competitions, ({ one, many }) => ({
  school: one(schools, {
    fields: [competitions.schoolId],
    references: [schools.id]
  }),
  creator: one(users, {
    fields: [competitions.createdBy],
    references: [users.id]
  }),
  accessList: many(competitionAccess),
  participants: many(competitionParticipants)
}));
