"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HealthGoals } from "../../types";
import { getGoals, saveGoals, getLatestMeasurement } from "../utils/storage";

export default function Goals() {
  const [goals, setGoals] = useState<HealthGoals | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    targetWeight: "",
    targetBodyFat: "",
    dailyCalories: "",
    dailyProtein: "",
    dailyCarbs: "",
    dailyFat: "",
    dailyWaterIntake: "",
    notes: ""
  });

  useEffect(() => {
    const currentGoals = getGoals();
    if (currentGoals) {
      setGoals(currentGoals);
      setFormData({
        targetWeight: currentGoals.targetWeight?.toString() || "",
        targetBodyFat: currentGoals.targetBodyFat?.toString() || "",
        dailyCalories: currentGoals.dailyCalories?.toString() || "",
        dailyProtein: currentGoals.dailyProtein?.toString() || "",
        dailyCarbs: currentGoals.dailyCarbs?.toString() || "",
        dailyFat: currentGoals.dailyFat?.toString() || "",
        dailyWaterIntake: currentGoals.dailyWaterIntake?.toString() || "",
        notes: currentGoals.notes || ""
      });
    }

    // Get latest weight from measurements
    const latestMeasurement = getLatestMeasurement();
    if (latestMeasurement) {
      setLatestWeight(latestMeasurement.weight);
    }
  }, []);

  // Add automatic PFC calculation based on body weight and total calories
  const calculatePFC = (calories: number, weight: number) => {
    // Protein: 2g per kg of body weight
    const proteinGrams = Math.round(weight * 2);
    const proteinCalories = proteinGrams * 4;

    // Fat: 20% of total calories
    const fatCalories = calories * 0.20;
    const fatGrams = Math.round(fatCalories / 9);

    // Carbs: remaining calories
    const remainingCalories = calories - proteinCalories - fatCalories;
    const carbsGrams = Math.round(remainingCalories / 4);

    return {
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams >= 0 ? carbsGrams : 0 // Ensure carbs don't go negative
    };
  };

  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const calories = Number(e.target.value);
    
    setFormData(prev => {
      if (calories > 0 && latestWeight) {
        const { protein, fat, carbs } = calculatePFC(calories, latestWeight);
        return {
          ...prev,
          dailyCalories: e.target.value,
          dailyProtein: protein.toString(),
          dailyFat: fat.toString(),
          dailyCarbs: carbs.toString()
        };
      }
      return {
        ...prev,
        dailyCalories: e.target.value,
        dailyProtein: "",
        dailyFat: "",
        dailyCarbs: ""
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoals: Omit<HealthGoals, "id"> = {
      targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
      targetBodyFat: formData.targetBodyFat ? Number(formData.targetBodyFat) : undefined,
      dailyCalories: formData.dailyCalories ? Number(formData.dailyCalories) : undefined,
      dailyProtein: formData.dailyProtein ? Number(formData.dailyProtein) : undefined,
      dailyCarbs: formData.dailyCarbs ? Number(formData.dailyCarbs) : undefined,
      dailyFat: formData.dailyFat ? Number(formData.dailyFat) : undefined,
      dailyWaterIntake: formData.dailyWaterIntake ? Number(formData.dailyWaterIntake) : undefined,
      notes: formData.notes || undefined
    };
    saveGoals(newGoals);
    setGoals({ ...newGoals, id: goals?.id || "temp" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Health Goals</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Body Goals</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetWeight: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Body Fat %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetBodyFat}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetBodyFat: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Nutrition Goals</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyCalories}
                      onChange={handleCaloriesChange}
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Recommended PFC Balance: Protein {latestWeight ? `${Math.round(latestWeight * 2)}g` : '(set your weight in Body Stats)'} / Fat 20% / Carbs remaining
                    </p>
                    {!latestWeight && (
                      <p className="mt-1 text-sm text-red-500">
                        Please set your current weight in Body Stats page for PFC calculation
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Protein (g)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyProtein}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyProtein: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Fat (g)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyFat}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyFat: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyCarbs}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyCarbs: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Water Intake (ml)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyWaterIntake}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyWaterIntake: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Goals
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 