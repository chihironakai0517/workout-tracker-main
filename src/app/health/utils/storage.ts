import { BodyMeasurement, Meal, DailyNutrition, HealthGoals, WeeklySummary, MonthlySummary } from "../../types";
import { v4 as uuidv4 } from "uuid";

const MEASUREMENTS_KEY = "body-measurements";
const NUTRITION_KEY = "daily-nutrition";
const GOALS_KEY = "health-goals";

// Body Measurements
export const saveMeasurement = (measurement: Omit<BodyMeasurement, "id">): void => {
  const measurements = getMeasurements();
  const newMeasurement = { ...measurement, id: uuidv4() };
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify([...measurements, newMeasurement]));
};

export const updateMeasurement = (measurement: BodyMeasurement): void => {
  const measurements = getMeasurements();
  const updatedMeasurements = measurements.map(m => 
    m.id === measurement.id ? measurement : m
  );
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(updatedMeasurements));
};

export const deleteMeasurement = (id: string): void => {
  const measurements = getMeasurements();
  const filteredMeasurements = measurements.filter(m => m.id !== id);
  localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(filteredMeasurements));
};

export const getMeasurements = (): BodyMeasurement[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MEASUREMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getLatestMeasurement = (): BodyMeasurement | null => {
  const measurements = getMeasurements();
  return measurements.length > 0
    ? measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
};

// Nutrition
export const saveDailyNutrition = (nutrition: Omit<DailyNutrition, "id">): void => {
  const existingData = getDailyNutrition(nutrition.date);
  const newData = { ...nutrition, id: existingData?.id || uuidv4() };
  
  const allData = getAllDailyNutrition().filter(d => d.date !== nutrition.date);
  localStorage.setItem(NUTRITION_KEY, JSON.stringify([...allData, newData]));
};

export const getAllDailyNutrition = (): DailyNutrition[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(NUTRITION_KEY);
  const result = data ? JSON.parse(data) : [];
  return result;
};

export function getDailyNutrition(date: string): DailyNutrition {
  const currentDate = date;
  const allData = getAllDailyNutrition();
  return allData.find(d => d.date === currentDate) || {
    id: crypto.randomUUID(),
    date: currentDate,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    waterIntake: 0
  };
}

export const addMeal = (meal: Omit<Meal, "id">): void => {
  const dailyData = getDailyNutrition(meal.date) || {
    id: uuidv4(),
    date: meal.date,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    waterIntake: 0,
  };

  const newMeal = { ...meal, id: uuidv4() };
  const updatedData: DailyNutrition = {
    ...dailyData,
    meals: [...dailyData.meals, newMeal],
    totalCalories: dailyData.totalCalories + meal.calories,
    totalProtein: dailyData.totalProtein + meal.protein,
    totalCarbs: dailyData.totalCarbs + meal.carbs,
    totalFat: dailyData.totalFat + meal.fat,
  };

  saveDailyNutrition(updatedData);
};

export const updateMeal = (date: string, updatedMeal: Meal): void => {
  const dailyData = getDailyNutrition(date);
  if (!dailyData) return;

  const updatedMeals = dailyData.meals.map(meal => 
    meal.id === updatedMeal.id ? updatedMeal : meal
  );

  const newTotals = updatedMeals.reduce((acc, meal) => ({
    totalCalories: acc.totalCalories + meal.calories,
    totalProtein: acc.totalProtein + meal.protein,
    totalCarbs: acc.totalCarbs + meal.carbs,
    totalFat: acc.totalFat + meal.fat,
  }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

  saveDailyNutrition({
    ...dailyData,
    meals: updatedMeals,
    ...newTotals
  });
};

export const deleteMeal = (date: string, mealId: string): void => {
  const dailyData = getDailyNutrition(date);
  if (!dailyData) return;

  const updatedMeals = dailyData.meals.filter(meal => meal.id !== mealId);
  const newTotals = updatedMeals.reduce((acc, meal) => ({
    totalCalories: acc.totalCalories + meal.calories,
    totalProtein: acc.totalProtein + meal.protein,
    totalCarbs: acc.totalCarbs + meal.carbs,
    totalFat: acc.totalFat + meal.fat,
  }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

  saveDailyNutrition({
    ...dailyData,
    meals: updatedMeals,
    ...newTotals
  });
};

export const updateWaterIntake = (date: string, value: number): void => {
  const dailyData = getDailyNutrition(date) || {
    id: uuidv4(),
    date,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    waterIntake: 0,
  };

  const updatedData: DailyNutrition = {
    ...dailyData,
    waterIntake: value
  };

  saveDailyNutrition(updatedData);
};

// Goals
export const saveGoals = (goals: Omit<HealthGoals, "id">): void => {
  const newGoals = { ...goals, id: uuidv4() };
  localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
};

export const getGoals = (): HealthGoals | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(GOALS_KEY);
  return data ? JSON.parse(data) : null;
};

// Summary Reports
export const getWeeklySummary = (startDate: Date): WeeklySummary => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  console.log("getWeeklySummary called with:", { 
    startDate: startDate.toISOString(), 
    endDate: endDate.toISOString(),
    startLocalDate: startDate.toLocaleDateString(),
    endLocalDate: endDate.toLocaleDateString()
  });

  const measurements = getMeasurements().filter(m => {
    const date = new Date(m.date);
    return date >= startDate && date <= endDate;
  });

  const nutritionData = getAllDailyNutrition().filter(d => {
    const date = new Date(d.date);
    const isInRange = date >= startDate && date <= endDate;
    console.log("Checking nutrition data:", {
      nutritionDate: d.date,
      parsedDate: date.toLocaleDateString(),
      isInRange,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString()
    });
    return isInRange;
  }).filter(d => {
    const hasData = d.totalCalories > 0 || d.waterIntake > 0 || d.meals.length > 0;
    console.log("Nutrition data has content:", {
      date: d.date,
      totalCalories: d.totalCalories,
      waterIntake: d.waterIntake,
      mealsCount: d.meals.length,
      hasData
    });
    return hasData;
  });

  console.log("Filtered weekly measurements:", measurements);
  console.log("Filtered weekly nutritionData:", nutritionData);

  const goals = getGoals();
  
  const recordedDays = Math.max(nutritionData.length, 1);
  
  console.log("Weekly recordedDays:", recordedDays, "nutritionData.length:", nutritionData.length);

  const result = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    averageWeight: measurements.length > 0
      ? measurements.reduce((acc, m) => acc + m.weight, 0) / measurements.length
      : undefined,
    averageBodyFat: measurements.some(m => m.bodyFat)
      ? measurements.reduce((acc, m) => acc + (m.bodyFat || 0), 0) / measurements.filter(m => m.bodyFat).length
      : undefined,
    totalWorkouts: 0,
    averageCalories: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalCalories, 0) / recordedDays
      : 0,
    averageProtein: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalProtein, 0) / recordedDays
      : 0,
    averageCarbs: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalCarbs, 0) / recordedDays
      : 0,
    averageFat: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalFat, 0) / recordedDays
      : 0,
    averageWaterIntake: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.waterIntake, 0) / recordedDays
      : 0,
    goalProgress: {
      weight: goals?.targetWeight
        ? (measurements[measurements.length - 1]?.weight || 0) - goals.targetWeight
        : undefined,
      bodyFat: goals?.targetBodyFat && measurements[measurements.length - 1]?.bodyFat !== undefined
        ? (measurements[measurements.length - 1]?.bodyFat || 0) - goals.targetBodyFat
        : undefined,
      calories: goals?.dailyCalories && nutritionData.length > 0
        ? nutritionData.reduce((acc, d) => acc + d.totalCalories, 0) / recordedDays - goals.dailyCalories
        : undefined,
      protein: goals?.dailyProtein && nutritionData.length > 0
        ? nutritionData.reduce((acc, d) => acc + d.totalProtein, 0) / recordedDays - goals.dailyProtein
        : undefined,
      carbs: goals?.dailyCarbs && nutritionData.length > 0
        ? nutritionData.reduce((acc, d) => acc + d.totalCarbs, 0) / recordedDays - goals.dailyCarbs
        : undefined,
      fat: goals?.dailyFat && nutritionData.length > 0
        ? nutritionData.reduce((acc, d) => acc + d.totalFat, 0) / recordedDays - goals.dailyFat
        : undefined,
      waterIntake: goals?.dailyWaterIntake && nutritionData.length > 0
        ? nutritionData.reduce((acc, d) => acc + d.waterIntake, 0) / recordedDays - goals.dailyWaterIntake
        : undefined,
    }
  };
  
  console.log("Weekly summary result:", result);
  return result;
};

export const getMonthlySummary = (year: number, month: number): MonthlySummary => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const measurements = getMeasurements().filter(m => {
    const date = new Date(m.date);
    return date >= startDate && date <= endDate;
  });

  const nutritionData = getAllDailyNutrition().filter(d => {
    const date = new Date(d.date);
    return date >= startDate && date <= endDate;
  }).filter(d => d.totalCalories > 0 || d.waterIntake > 0 || d.meals.length > 0);

  const weeklyReports: WeeklySummary[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    weeklyReports.push(getWeeklySummary(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  const recordedDays = Math.max(nutritionData.length, 1);

  const result = {
    month,
    year,
    averageWeight: measurements.length > 0
      ? measurements.reduce((acc, m) => acc + m.weight, 0) / measurements.length
      : undefined,
    averageBodyFat: measurements.some(m => m.bodyFat)
      ? measurements.reduce((acc, m) => acc + (m.bodyFat || 0), 0) / measurements.filter(m => m.bodyFat).length
      : undefined,
    totalWorkouts: weeklyReports.reduce((acc, w) => acc + w.totalWorkouts, 0),
    averageCalories: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalCalories, 0) / recordedDays
      : 0,
    averageProtein: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalProtein, 0) / recordedDays
      : 0,
    averageCarbs: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalCarbs, 0) / recordedDays
      : 0,
    averageFat: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.totalFat, 0) / recordedDays
      : 0,
    averageWaterIntake: nutritionData.length > 0 
      ? nutritionData.reduce((acc, d) => acc + d.waterIntake, 0) / recordedDays
      : 0,
    goalProgress: weeklyReports[weeklyReports.length - 1].goalProgress,
    weeklyProgress: weeklyReports
  };
  
  return result;
}; 