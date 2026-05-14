"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { getDailyMeal, addMeal, deleteMeal, updateWaterIntake } from "../meal/utils";
import type { Meal, DailyMeal } from "../meal/utils";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

const MEAL_TYPE_COLORS: { [key: string]: string } = {
  Breakfast: "bg-amber-100 text-amber-800 border-amber-200",
  Lunch: "bg-green-100 text-green-800 border-green-200",
  Dinner: "bg-blue-100 text-blue-800 border-blue-200",
  Snack: "bg-purple-100 text-purple-800 border-purple-200",
};

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value}g</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function NutritionTracker() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dailyData, setDailyData] = useState<DailyMeal | null>(null);
  const [newMeal, setNewMeal] = useState<Omit<Meal, "id" | "date">>({
    name: "",
    mealType: "Breakfast",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    time: format(new Date(), "HH:mm"),
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    setDailyData(getDailyMeal(currentDate));
  }, [currentDate, mounted]);

  const handleAddMeal = () => {
    if (!newMeal.name || !mounted) return;
    addMeal({ ...newMeal, date: currentDate });
    setNewMeal({ name: "", mealType: "Breakfast", calories: 0, protein: 0, carbs: 0, fat: 0, time: format(new Date(), "HH:mm") });
    setDailyData(getDailyMeal(currentDate));
  };

  const handleWaterIntakeChange = (value: string) => {
    if (!mounted) return;
    updateWaterIntake(currentDate, parseInt(value) || 0);
    setDailyData(getDailyMeal(currentDate));
  };

  const handleDeleteMeal = (mealId: string) => {
    if (!mounted) return;
    deleteMeal(currentDate, mealId);
    setDailyData(getDailyMeal(currentDate));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<Meal, "id" | "date">) => {
    const value = field === "time" || field === "mealType" ? e.target.value : parseInt(e.target.value) || 0;
    setNewMeal(prev => ({ ...prev, [field]: value }));
  };

  if (!mounted) return null;

  const cal = dailyData?.totalCalories ?? 0;
  const protein = dailyData?.totalProtein ?? 0;
  const carbs = dailyData?.totalCarbs ?? 0;
  const fat = dailyData?.totalFat ?? 0;
  const water = dailyData?.waterIntake ?? 0;
  const waterPct = Math.min(100, Math.round((water / 2000) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Meal Tracking</h1>
                <p className="text-green-100 text-sm mt-1">Log meals and track your daily macros</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={currentDate}
                  onChange={e => setCurrentDate(e.target.value)}
                  className="px-3 py-2 text-sm bg-white/20 text-white rounded-lg border border-white/30 backdrop-blur-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Link
                  href="/"
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30 whitespace-nowrap"
                >
                  ← Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Add Meal Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add New Meal</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Meal type tabs */}
              <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-xl p-1">
                {MEAL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setNewMeal(prev => ({ ...prev, mealType: type }))}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      newMeal.mealType === type
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <input
                placeholder="Meal name"
                value={newMeal.name}
                onChange={e => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-gray-50"
              />

              <div className="grid grid-cols-2 gap-3">
                {(["calories", "protein", "carbs", "fat"] as const).map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                      {field}{field !== "calories" ? " (g)" : " (kcal)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newMeal[field] || ""}
                      onChange={e => handleInputChange(e, field)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-gray-50"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  value={newMeal.time}
                  onChange={e => handleInputChange(e, "time")}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-gray-50"
                />
              </div>

              <button
                onClick={handleAddMeal}
                disabled={!newMeal.name}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Meal
              </button>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Daily Summary</h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Calorie highlight */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border border-orange-100">
                  <p className="text-xs font-medium text-orange-600 mb-1">Total Calories</p>
                  <p className="text-4xl font-bold text-orange-900">{cal}</p>
                  <p className="text-xs text-orange-600 mt-1">kcal</p>
                </div>

                {/* Macro bars */}
                <div className="space-y-3">
                  <MacroBar label="Protein" value={protein} max={150} color="bg-blue-500" />
                  <MacroBar label="Carbs" value={carbs} max={300} color="bg-amber-400" />
                  <MacroBar label="Fat" value={fat} max={80} color="bg-rose-400" />
                </div>

                {/* Water intake */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">💧 Water</span>
                    <span className="text-blue-600 font-semibold">{water} / 2000 ml</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                    <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all" style={{ width: `${waterPct}%` }} />
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={water || ""}
                    onChange={e => handleWaterIntakeChange(e.target.value)}
                    placeholder="Enter water intake (ml)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal list */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Meals</h2>
            <span className="text-sm text-gray-500">{dailyData?.meals.length ?? 0} entries</span>
          </div>
          <div className="divide-y divide-gray-50">
            {(dailyData?.meals.length ?? 0) === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🍽️</div>
                <p className="font-medium">No meals logged yet</p>
                <p className="text-sm mt-1">Add your first meal above</p>
              </div>
            ) : (
              dailyData?.meals.map(meal => (
                <div key={meal.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">{meal.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${MEAL_TYPE_COLORS[meal.mealType] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {meal.mealType}
                      </span>
                      <span className="text-xs text-gray-400">{meal.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">{meal.calories} kcal</span>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">P {meal.protein}g</span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">C {meal.carbs}g</span>
                      <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">F {meal.fat}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
