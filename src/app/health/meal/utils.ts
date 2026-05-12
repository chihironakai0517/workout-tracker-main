// This file re-exports from the unified nutrition storage.
// All meal data is stored under the 'daily-nutrition' key via health/utils/storage.ts.
export { getDailyNutrition as getDailyMeal, addMeal, deleteMeal, updateWaterIntake } from '../utils/storage';
export type { DailyNutrition as DailyMeal } from '../../types';
export type { Meal } from '../../types';
