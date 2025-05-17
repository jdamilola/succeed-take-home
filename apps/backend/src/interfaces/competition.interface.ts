export type CompetitionVisibility = 'public' | 'private' | 'restricted';

export interface Competition {
  id: string;
  name: string;
  description?: string;
  rules?: string;
  visibility: CompetitionVisibility;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  school: {
    id: string;
    name: string;
  };
}

export interface CreateCompetitionDto {
  schoolId: string;
  name: string;
  description?: string;
  rules?: string;
  visibility?: CompetitionVisibility;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
}

export interface UpdateCompetitionDto {
  name?: string;
  description?: string;
  rules?: string;
  visibility?: CompetitionVisibility;
  startDate?: Date;
  endDate?: Date;
}

export interface CompetitionAccessEntry {
  competitionId: string;
  schoolId: string;
  createdAt: Date;
}

export interface CreateAccessDto {
  competitionId: string;
  schoolId: string;
}

export interface CompetitionParticipant {
  id: string;
  joinedAt: Date;
  school: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  competition: {
    id: string;
    name: string;
  };
}

export interface CreateParticipantDto {
  competitionId: string;
  userId: string;
  schoolId: string;
}
