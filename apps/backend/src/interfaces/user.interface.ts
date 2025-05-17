export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  schoolId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

export interface UserInfo {
  id: string;
  schoolId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface CreateUserDto {
  schoolId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}
