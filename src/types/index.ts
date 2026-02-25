export type UserRole = "admin" | "member";
export type GoalType = "bulk" | "cut" | "maintain";

export interface UserProfile {
  heightCm?: number;
  weightKg?: number;
  goal?: GoalType;
  age?: number;
  gender?: string;
  activityLevel?: "low" | "medium" | "high";
}

export interface AppUser {
  name: string;
  email: string;
  role: UserRole;
  createdAt?: unknown;
  profile?: UserProfile;
}

export interface Trainer {
  id?: string;
  name: string;
  specialization: string;
  experienceYears: number;
  phone?: string;
  availability: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Exercise {
  id?: string;
  name: string;
  muscleGroup: string;
  equipment: "bodyweight" | "dumbbell" | "barbell" | "machine" | "band" | "other";
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Plan {
  id?: string;
  uid: string;
  type: "diet" | "workout";
  goal: GoalType;
  generatedAt?: unknown;
  summary: string;
  data: Record<string, unknown>;
}

export interface DataEntry {
  id?: string;
  uid: string;
  date: string;
  weightKg?: number;
  workoutNotes: string;
  dietNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
