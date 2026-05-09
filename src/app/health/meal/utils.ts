import { v4 as uuidv4 } from 'uuid';
import { saveDailyNutrition, getAllDailyNutrition } from '../utils/storage';
import type { DailyNutrition } from '../../types';

export interface Meal {
  id: string;
  name: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  date: string;
}

export interface DailyMeal {
  date: string;
  meals: Meal[];
  waterIntake: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const STORAGE_KEY = 'workout-tracker-meals';

const getStoredMeals = (): Record<string, DailyMeal> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const storeMeals = (meals: Record<string, DailyMeal>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  } catch {
    // Handle storage errors silently
  }
};

const createEmptyDailyMeal = (date: string): DailyMeal => ({
  date,
  meals: [],
  waterIntake: 0,
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
});

export const getDailyMeal = (date: string): DailyMeal => {
  const meals = getStoredMeals();
  
  if (!meals[date]) {
    // Check if data exists in nutrition storage
    const allNutrition = getAllDailyNutrition();
    const nutritionData = allNutrition.find(n => n.date === date);
    
    if (nutritionData) {
      // Convert from nutrition format to meal format
      const dailyMeal: DailyMeal = {
        date: nutritionData.date,
        meals: nutritionData.meals.map(meal => ({
          ...meal,
          mealType: meal.mealType as "Breakfast" | "Lunch" | "Dinner" | "Snack"
        })),
        waterIntake: nutritionData.waterIntake,
        totalCalories: nutritionData.totalCalories,
        totalProtein: nutritionData.totalProtein,
        totalCarbs: nutritionData.totalCarbs,
        totalFat: nutritionData.totalFat,
      };
      
      meals[date] = dailyMeal;
      storeMeals(meals);
      return dailyMeal;
    }
    
    meals[date] = createEmptyDailyMeal(date);
    storeMeals(meals);
  }
  
  return meals[date];
};

// Convert DailyMeal to DailyNutrition format
const convertToNutritionFormat = (dailyMeal: DailyMeal): Omit<DailyNutrition, 'id'> => {
  return {
    date: dailyMeal.date,
    meals: dailyMeal.meals.map(meal => ({
      ...meal,
      mealType: meal.mealType as "Breakfast" | "Lunch" | "Dinner" | "Snack"
    })),
    totalCalories: dailyMeal.totalCalories,
    totalProtein: dailyMeal.totalProtein,
    totalCarbs: dailyMeal.totalCarbs,
    totalFat: dailyMeal.totalFat,
    waterIntake: dailyMeal.waterIntake
  };
};

export const addMeal = (meal: Omit<Meal, 'id'>) => {
  const meals = getStoredMeals();
  const dailyMeal = meals[meal.date] || createEmptyDailyMeal(meal.date);

  const newMeal = {
    ...meal,
    id: uuidv4(),
  };

  dailyMeal.meals.push(newMeal);
  dailyMeal.totalCalories += meal.calories;
  dailyMeal.totalProtein += meal.protein;
  dailyMeal.totalCarbs += meal.carbs;
  dailyMeal.totalFat += meal.fat;

  meals[meal.date] = dailyMeal;
  storeMeals(meals);
  
  // Sync with nutrition storage
  saveDailyNutrition(convertToNutritionFormat(dailyMeal));
};

export const deleteMeal = (mealId: string, date: string) => {
  const meals = getStoredMeals();
  const dailyMeal = meals[date];

  if (!dailyMeal) return;

  const mealToDelete = dailyMeal.meals.find(meal => meal.id === mealId);
  if (!mealToDelete) return;

  dailyMeal.meals = dailyMeal.meals.filter(meal => meal.id !== mealId);
  dailyMeal.totalCalories -= mealToDelete.calories;
  dailyMeal.totalProtein -= mealToDelete.protein;
  dailyMeal.totalCarbs -= mealToDelete.carbs;
  dailyMeal.totalFat -= mealToDelete.fat;

  meals[date] = dailyMeal;
  storeMeals(meals);
  
  // Sync with nutrition storage
  saveDailyNutrition(convertToNutritionFormat(dailyMeal));
};

export const updateWaterIntake = (date: string, waterIntake: number) => {
  const meals = getStoredMeals();
  const dailyMeal = meals[date];

  if (!dailyMeal) return;

  dailyMeal.waterIntake = waterIntake;
  meals[date] = dailyMeal;
  storeMeals(meals);
  
  // Sync with nutrition storage
  saveDailyNutrition(convertToNutritionFormat(dailyMeal));
}; 