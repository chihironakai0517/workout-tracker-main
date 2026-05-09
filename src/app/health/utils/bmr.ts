export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
): number => {
  const genderFactor = gender === "male" ? 5 : -161;
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + genderFactor;
  return Math.round(bmr);
};

export const calculateTDEE = (
  bmr: number,
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
): number => {
  const activityMultipliers = {
    sedentary: 1.2,        // Little or no exercise
    lightly_active: 1.375, // Light exercise 1-3 days/week
    moderately_active: 1.55, // Moderate exercise 3-5 days/week
    very_active: 1.725,    // Hard exercise 6-7 days/week
    extremely_active: 1.9  // Very hard exercise, physical job
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

export const getActivityLevelLabel = (activityLevel: string): string => {
  const labels = {
    sedentary: "Sedentary (little/no exercise)",
    lightly_active: "Lightly Active (light exercise 1-3 days/week)",
    moderately_active: "Moderately Active (moderate exercise 3-5 days/week)",
    very_active: "Very Active (hard exercise 6-7 days/week)",
    extremely_active: "Extremely Active (very hard exercise, physical job)"
  };
  
  return labels[activityLevel as keyof typeof labels] || activityLevel;
};
