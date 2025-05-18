import { db } from './index';
import { schools, users, competitions, competitionAccess, competitionParticipants } from './schema';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import logger from '@succeed/logger';

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Generate password hashes
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    // Create schools
    const schoolIds = {
      harvard: uuidv4(),
      oxford: uuidv4(),
      cambridge: uuidv4(),
      yale: uuidv4(),
      stanford: uuidv4()
    };

    await db.insert(schools).values([
      {
        id: schoolIds.harvard,
        name: 'Harvard University',
        domain: 'harvard',
        logoUrl: 'https://example.com/harvard-logo.png'
      },
      {
        id: schoolIds.oxford,
        name: 'Oxford University',
        domain: 'oxford',
        logoUrl: 'https://example.com/oxford-logo.png'
      },
      {
        id: schoolIds.yale,
        name: 'Yale University',
        domain: 'yale',
        logoUrl: 'https://example.com/yale-logo.png'
      },
      {
        id: schoolIds.stanford,
        name: 'Stanford University',
        domain: 'stanford',
        logoUrl: 'https://example.com/stanford-logo.png'
      },
      {
        id: schoolIds.cambridge,
        name: 'Cambridge University',
        domain: 'cambridge',
        logoUrl: 'https://example.com/cambridge-logo.png'
      }
    ]);
    logger.info('Schools seeded successfully');

    // Create users
    const userIds = {
      harvardAdmin: uuidv4(),
      harvardStudent1: uuidv4(),
      harvardStudent2: uuidv4(),
      stanfordAdmin: uuidv4(),
      stanfordStudent: uuidv4(),
      stanfordStudent2: uuidv4(),
      yaleAdmin: uuidv4(),
      yaleStudent: uuidv4(),
      yaleStudent2: uuidv4(),
      oxfordAdmin: uuidv4(),
      oxfordStudent: uuidv4(),
      oxfordStudent2: uuidv4(),
      cambridgeAdmin: uuidv4(),
      cambridgeStudent: uuidv4(),
      cambridgeStudent2: uuidv4()
    };

    await db.insert(users).values([
      {
        id: userIds.harvardAdmin,
        schoolId: schoolIds.harvard,
        email: 'admin@harvard.edu',
        passwordHash: adminPasswordHash,
        firstName: 'Harvard',
        lastName: 'Admin',
        role: 'admin'
      },
      {
        id: userIds.harvardStudent1,
        schoolId: schoolIds.harvard,
        email: 'student@harvard.edu',
        passwordHash: studentPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      },
      {
        id: userIds.harvardStudent2,
        schoolId: schoolIds.harvard,
        email: 'student2@harvard.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student'
      },
      {
        id: userIds.stanfordAdmin,
        schoolId: schoolIds.stanford,
        email: 'admin@stanford.edu',
        passwordHash: adminPasswordHash,
        firstName: 'Stanford',
        lastName: 'Admin',
        role: 'admin'
      },
      {
        id: userIds.stanfordStudent,
        schoolId: schoolIds.stanford,
        email: 'student@stanford.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'student'
      },
      {
        id: userIds.stanfordStudent2,
        schoolId: schoolIds.stanford,
        email: 'student2@stanford.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Bob',
        lastName: 'Williams',
        role: 'student'
      },
      {
        id: userIds.yaleAdmin,
        schoolId: schoolIds.yale,
        email: 'admin@yale.edu',
        passwordHash: adminPasswordHash,
        firstName: 'Yale',
        lastName: 'Admin',
        role: 'admin'
      },
      {
        id: userIds.yaleStudent,
        schoolId: schoolIds.yale,
        email: 'student@yale.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Bob',
        lastName: 'Williams',
        role: 'student'
      },
      {
        id: userIds.yaleStudent2,
        schoolId: schoolIds.yale,
        email: 'student2@yale.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'student'
      },
      {
        id: userIds.oxfordAdmin,
        schoolId: schoolIds.oxford,
        email: 'admin@oxford.edu',
        passwordHash: adminPasswordHash,
        firstName: 'Oxford',
        lastName: 'Admin',
        role: 'admin'
      },
      {
        id: userIds.oxfordStudent,
        schoolId: schoolIds.oxford,
        email: 'student@oxford.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'student'
      },
      {
        id: userIds.oxfordStudent2,
        schoolId: schoolIds.oxford,
        email: 'student2@oxford.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Bob',
        lastName: 'Williams',
        role: 'student'
      },
      {
        id: userIds.cambridgeAdmin,
        schoolId: schoolIds.cambridge,
        email: 'admin@cambridge.edu',
        passwordHash: adminPasswordHash,
        firstName: 'Cambridge',
        lastName: 'Admin',
        role: 'admin'
      },
      {
        id: userIds.cambridgeStudent,
        schoolId: schoolIds.cambridge,
        email: 'student@cambridge.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'student'
      },
      {
        id: userIds.cambridgeStudent2,
        schoolId: schoolIds.cambridge,
        email: 'student2@cambridge.edu',
        passwordHash: studentPasswordHash,
        firstName: 'Bob',
        lastName: 'Williams',
        role: 'student'
      }
    ]);
    logger.info('Users seeded successfully');

    // Create competitions
    const competitionIds = {
      harvardPublic: uuidv4(),
      harvardPrivate: uuidv4(),
      harvardRestricted: uuidv4(),
      stanfordPublic: uuidv4(),
      yalePrivate: uuidv4()
    };

    const now = new Date();
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    await db.insert(competitions).values([
      {
        id: competitionIds.harvardPublic,
        schoolId: schoolIds.harvard,
        name: 'Harvard Public Hackathon',
        description: 'A public hackathon for all students',
        rules: 'Standard hackathon rules apply',
        visibility: 'public',
        startDate: now,
        endDate: oneMonthFromNow,
        createdBy: userIds.harvardAdmin
      },
      {
        id: competitionIds.harvardPrivate,
        schoolId: schoolIds.harvard,
        name: 'Harvard Private Competition',
        description: 'A private competition only for Harvard students',
        rules: 'Harvard students only',
        visibility: 'private',
        startDate: now,
        endDate: oneMonthFromNow,
        createdBy: userIds.harvardAdmin
      },
      {
        id: competitionIds.harvardRestricted,
        schoolId: schoolIds.harvard,
        name: 'Ivy League Challenge',
        description: 'A restricted competition for selected schools',
        rules: 'For Harvard and Stanford students only',
        visibility: 'restricted',
        startDate: now,
        endDate: oneMonthFromNow,
        createdBy: userIds.harvardAdmin
      },
      {
        id: competitionIds.stanfordPublic,
        schoolId: schoolIds.stanford,
        name: 'Stanford Innovation Challenge',
        description: 'Public innovation challenge by Stanford',
        rules: 'Open to all participants',
        visibility: 'public',
        startDate: now,
        endDate: oneMonthFromNow,
        createdBy: userIds.stanfordAdmin
      },
      {
        id: competitionIds.yalePrivate,
        schoolId: schoolIds.yale,
        name: 'Yale Annual Competition',
        description: 'Private competition for Yale students',
        rules: 'Yale students only',
        visibility: 'private',
        startDate: now,
        endDate: oneMonthFromNow,
        createdBy: userIds.yaleAdmin
      }
    ]);
    logger.info('Competitions seeded successfully');

    // Define competition access for restricted competitions
    await db.insert(competitionAccess).values([
      {
        competitionId: competitionIds.harvardRestricted,
        schoolId: schoolIds.harvard
      },
      {
        competitionId: competitionIds.harvardRestricted,
        schoolId: schoolIds.stanford
      }
    ]);
    logger.info('Competition access rules seeded successfully');

    // Add participants to competitions
    await db.insert(competitionParticipants).values([
      {
        id: uuidv4(),
        competitionId: competitionIds.harvardPublic,
        userId: userIds.harvardStudent1,
        schoolId: schoolIds.harvard
      },
      {
        id: uuidv4(),
        competitionId: competitionIds.harvardPublic,
        userId: userIds.harvardStudent2,
        schoolId: schoolIds.harvard
      },
      {
        id: uuidv4(),
        competitionId: competitionIds.harvardPrivate,
        userId: userIds.harvardStudent1,
        schoolId: schoolIds.harvard
      },
      {
        id: uuidv4(),
        competitionId: competitionIds.harvardRestricted,
        userId: userIds.harvardStudent2,
        schoolId: schoolIds.harvard
      },
      {
        id: uuidv4(),
        competitionId: competitionIds.stanfordPublic,
        userId: userIds.stanfordStudent,
        schoolId: schoolIds.stanford
      },
      {
        id: uuidv4(),
        competitionId: competitionIds.harvardRestricted,
        userId: userIds.stanfordStudent,
        schoolId: schoolIds.stanford
      },
      {
        id: uuidv4(),
        competitionId: competitionIds.yalePrivate,
        userId: userIds.yaleStudent,
        schoolId: schoolIds.yale
      }
    ]);
    logger.info('Competition participants seeded successfully');

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error(`Error seeding database: ${error}`);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  console.log('Seeding database...');
  seed()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Seeding failed: ${error}`);
      process.exit(1);
    });
}

export default seed; 