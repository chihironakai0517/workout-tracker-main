"use client";

import * as React from "react";
import { useState, useEffect, ChangeEvent } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDailyMeal, addMeal, deleteMeal, updateWaterIntake } from "../meal/utils";
import type { Meal, DailyMeal } from "../meal/utils";

export default function NutritionTracker() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dailyData, setDailyData] = useState<DailyMeal | null>(null);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const data = getDailyMeal(currentDate);
    setDailyData(data);
  }, [currentDate, mounted]);

  const handleAddMeal = () => {
    if (!newMeal.name || !mounted) return;

    addMeal({
      ...newMeal,
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
    if (!mounted) return;
    const waterIntake = parseInt(value) || 0;
    updateWaterIntake(currentDate, waterIntake);
    const updatedData = getDailyMeal(currentDate);
    setDailyData(updatedData);
  };

  const handleDeleteMeal = (mealId: string) => {
    if (!mounted) return;
    deleteMeal(mealId, currentDate);
    const updatedData = getDailyMeal(currentDate);
    setDailyData(updatedData);
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<Meal, 'id' | 'date'>) => {
    const value = field === 'time' ? e.target.value : parseInt(e.target.value) || 0;
    setNewMeal({ ...newMeal, [field]: value });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900">Meal Tracking</h1>
      <div className="mt-4">
        <Input
          type="date"
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Meal name"
                  value={newMeal.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Calories"
                  value={newMeal.calories || ""}
                  onChange={(e) => handleInputChange(e, 'calories')}
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
            <CardTitle>Daily Summary</CardTitle>
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
              <div>
                <p>Total Calories: {dailyData?.totalCalories || 0}</p>
                <p>Total Protein: {dailyData?.totalProtein || 0}g</p>
                <p>Total Carbs: {dailyData?.totalCarbs || 0}g</p>
                <p>Total Fat: {dailyData?.totalFat || 0}g</p>
              </div>
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
                  <h3 className="font-medium">{meal.name}</h3>
                  <p className="text-sm text-gray-500">{meal.time}</p>
                  <p className="text-sm">
                    {meal.calories} cal | {meal.protein}g protein | {meal.carbs}g
                    carbs | {meal.fat}g fat
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