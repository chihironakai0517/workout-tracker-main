import { WorkoutHistory, WorkoutSummary } from '../types';

const STORAGE_KEY = 'workout-history';

export const saveWorkout = (workout: WorkoutHistory): void => {
  const existingWorkouts = getWorkouts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingWorkouts, workout]));
};

export const getWorkouts = (): WorkoutHistory[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getWorkoutById = (id: string): WorkoutHistory | null => {
  const workouts = getWorkouts();
  return workouts.find(w => w.id === id) || null;
};

export const getWorkoutSummaries = (): WorkoutSummary[] => {
  return getWorkouts().map(workout => ({
    id: workout.id,
    date: workout.date,
    exerciseCount: workout.muscleGroups.reduce(
      (total, group) => total + group.exercises.length,
      0
    ),
    totalCalories: workout.totalCalories,
  }));
};

export const getLastWorkout = (): WorkoutHistory | null => {
  const workouts = getWorkouts();
  return workouts.length > 0 ? workouts[workouts.length - 1] : null;
};

export const updateWorkout = (id: string, updatedWorkout: WorkoutHistory): void => {
  const workouts = getWorkouts();
  const index = workouts.findIndex(w => w.id === id);
  if (index !== -1) {
    workouts[index] = updatedWorkout;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }
};

export const deleteWorkout = (id: string): void => {
  const workouts = getWorkouts();
  const filtered = workouts.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// Timer settings
const TIMER_SETTINGS_KEY = 'timer-settings';

export interface TimerSettings {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

export const getTimerSettings = (): TimerSettings => {
  const data = localStorage.getItem(TIMER_SETTINGS_KEY);
  return data ? JSON.parse(data) : { vibrationEnabled: true, soundEnabled: true };
};

export const saveTimerSettings = (settings: TimerSettings): void => {
  localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings));
};
