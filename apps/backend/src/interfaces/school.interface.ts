export interface School {
  id: string;
  name: string;
  domain?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchoolDto {
  name: string;
  domain?: string;
  logoUrl?: string;
}

export interface UpdateSchoolDto {
  name?: string;
  domain?: string;
  logoUrl?: string;
}
