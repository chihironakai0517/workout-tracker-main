export type BaseExercise = {
  name: string;
};

export type WeightExercise = BaseExercise & {
  type: 'weight';
  weight: number;
  reps: number;
  sets: number;
};

export type CardioExercise = BaseExercise & {
  type: 'cardio';
  duration: number;
  distance: number;
  calories: number;
};

export type Exercise = WeightExercise | CardioExercise;

export type MuscleGroup = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export interface WorkoutHistory {
  id: string;
  date: string;
  muscleGroups: MuscleGroup[];
  totalCalories: number;
}

export interface WorkoutSummary {
  id: string;
  date: string;
  exerciseCount: number;
  totalCalories: number;
} 