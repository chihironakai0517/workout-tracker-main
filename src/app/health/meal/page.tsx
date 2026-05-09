"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDailyMeal, addMeal, deleteMeal, updateWaterIntake } from "./utils";
import type { Meal, DailyMeal } from "./utils";
import { getGoals, getLatestMeasurement } from "../utils/storage";
import type { HealthGoals } from "../../types";
import { calculateTDEE } from "../utils/bmr";

export default function MealTracker() {
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dailyData, setDailyData] = useState<DailyMeal | null>(null);
  const [goals, setGoals] = useState<HealthGoals | null>(null);
  const [latestMeasurement, setLatestMeasurement] = useState<any>(null);
  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id' | 'date'>>({
    name: "",
    mealType: "Breakfast",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    time: format(new Date(), "HH:mm"),
  });

  useEffect(() => {
    const data = getDailyMeal(currentDate);
    setDailyData(data);
    
    const currentGoals = getGoals();
    setGoals(currentGoals);

    const measurement = getLatestMeasurement();
    setLatestMeasurement(measurement);
  }, [currentDate]);

  const calculateCaloriesFromMacros = (protein: number, carbs: number, fat: number) => {
    return (protein * 4) + (carbs * 4) + (fat * 9);
  };

  const handleAddMeal = () => {
    const mealName = newMeal.name || newMeal.mealType;

    const calculatedCalories = calculateCaloriesFromMacros(
      newMeal.protein,
      newMeal.carbs,
      newMeal.fat
    );

    addMeal({
      ...newMeal,
      name: mealName,
      calories: calculatedCalories,
      date: currentDate,
    });

    setNewMeal({
      name: "",
      mealType: "Breakfast",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      time: format(new Date(), "HH:mm"),
    });

    const updatedData = getDailyMeal(currentDate);
    setDailyData(updatedData);
  };

  const handleWaterIntakeChange = (value: string) => {
    const waterIntake = parseInt(value) || 0;
    updateWaterIntake(currentDate, waterIntake);
    const updatedData = getDailyMeal(currentDate);
    setDailyData(updatedData);
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteMeal(mealId, currentDate);
    const updatedData = getDailyMeal(currentDate);
    setDailyData(updatedData);
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<Meal, 'id' | 'date'>) => {
    const value = field === 'time' ? e.target.value : parseInt(e.target.value) || 0;
    const updatedMeal = { ...newMeal, [field]: value };
    
    if (field === 'protein' || field === 'carbs' || field === 'fat') {
      updatedMeal.calories = calculateCaloriesFromMacros(
        field === 'protein' ? value as number : newMeal.protein,
        field === 'carbs' ? value as number : newMeal.carbs,
        field === 'fat' ? value as number : newMeal.fat
      );
    }
    
    setNewMeal(updatedMeal);
  };

  const handleMealTypeChange = (value: string) => {
    setNewMeal({ ...newMeal, mealType: value as "Breakfast" | "Lunch" | "Dinner" | "Snack" });
  };

  const calculateProgress = (current: number, target: number | undefined) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const ProgressBar = ({ label, current, target, unit }: {
    label: string;
    current: number;
    target: number | undefined;
    unit: string;
  }) => {
    const progress = calculateProgress(current, target);
    const progressColor = getProgressColor(progress);
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span>
            {current}{unit} / {target || 0}{unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={"h-2 rounded-full " + progressColor + " transition-all duration-300"}
            style={{ width: progress + "%" }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {progress.toFixed(1)}% of goal
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Meal Tracking</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back
        </Link>
      </div>
      
      <div className="mt-4">
        <Input
          type="date"
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Select value={newMeal.mealType} onValueChange={handleMealTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Meal name (optional)"
                  value={newMeal.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Protein (g)"
                  value={newMeal.protein || ""}
                  onChange={(e) => handleInputChange(e, 'protein')}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Carbs (g)"
                  value={newMeal.carbs || ""}
                  onChange={(e) => handleInputChange(e, 'carbs')}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Fat (g)"
                  value={newMeal.fat || ""}
                  onChange={(e) => handleInputChange(e, 'fat')}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Calories (auto-calculated)"
                  value={newMeal.calories || ""}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatically calculated from macros
                </p>
              </div>
              <div>
                <Input
                  type="time"
                  value={newMeal.time}
                  onChange={(e) => handleInputChange(e, 'time')}
                />
              </div>
              <Button onClick={handleAddMeal}>Add Meal</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress vs Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goals ? (
              <div className="space-y-4">
                <ProgressBar
                  label="Water Intake"
                  current={dailyData?.waterIntake || 0}
                  target={goals.dailyWaterIntake}
                  unit="ml"
                />
                <ProgressBar
                  label="Total Calories"
                  current={dailyData?.totalCalories || 0}
                  target={goals.dailyCalories}
                  unit=""
                />
                <ProgressBar
                  label="Total Protein"
                  current={dailyData?.totalProtein || 0}
                  target={goals.dailyProtein}
                  unit="g"
                />
                <ProgressBar
                  label="Total Fat"
                  current={dailyData?.totalFat || 0}
                  target={goals.dailyFat}
                  unit="g"
                />
                <ProgressBar
                  label="Total Carbs"
                  current={dailyData?.totalCarbs || 0}
                  target={goals.dailyCarbs}
                  unit="g"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>No goals set</p>
                <Link
                  href="/health/goals"
                  className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
                >
                  Set your goals
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calorie Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Water Intake (ml)
                </label>
                <Input
                  type="number"
                  value={dailyData?.waterIntake || 0}
                  onChange={(e) => handleWaterIntakeChange(e.target.value)}
                />
              </div>
              
              {latestMeasurement && latestMeasurement.bmr && latestMeasurement.activityLevel ? (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Daily Calorie Balance</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Daily Calorie Burn (TDEE):</span>
                      <span className="font-medium">
                        {calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)} kcal
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Calories Consumed:</span>
                      <span className="font-medium">{dailyData?.totalCalories || 0} kcal</span>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Calorie Balance:</span>
                        <span className={
                          ((dailyData?.totalCalories || 0) - calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)) > 0
                            ? "text-red-600" 
                            : "text-green-600"
                        }>
                          {((dailyData?.totalCalories || 0) - calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)) > 0 ? "+" : ""}
                          {(dailyData?.totalCalories || 0) - calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)} kcal
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((dailyData?.totalCalories || 0) - calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)) > 0
                          ? "Caloric surplus (potential weight gain)"
                          : "Caloric deficit (potential weight loss)"
                        }
                      </p>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Visual Balance</h4>
                      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-orange-400 transition-all duration-300"
                          style={{ 
                            width: Math.min(
                              ((dailyData?.totalCalories || 0) / calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)) * 100, 
                              100
                            ) + "%" 
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                          {Math.round(((dailyData?.totalCalories || 0) / calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)) * 100)}%
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 kcal</span>
                        <span>{calculateTDEE(latestMeasurement.bmr, latestMeasurement.activityLevel)} kcal (100%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t text-center text-gray-500">
                  <p>No body measurements found</p>
                  <Link
                    href="/health/measurements"
                    className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
                  >
                    Add body measurements
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyData?.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {meal.mealType}
                    </span>
                    <h3 className="font-medium">{meal.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{meal.time}</p>
                  <p className="text-sm">
                    {meal.calories} cal | {meal.protein}g protein | {meal.fat}g fat | {meal.carbs}g
                    carbs 
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteMeal(meal.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 