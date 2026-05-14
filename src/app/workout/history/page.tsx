"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkouts, deleteWorkout } from "../utils/storage";
import { WorkoutHistory } from "../types";

const MUSCLE_COLORS: { [key: string]: string } = {
  Chest: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200",
  Back: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
  Shoulders: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
  Arms: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
  Legs: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200",
  Abs: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200",
  Cardio: "bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200",
};

const muscleColor = (name: string) =>
  MUSCLE_COLORS[name] ?? "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";

export default function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const workoutData = getWorkouts();
    setWorkouts(workoutData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, []);

  const handleDeleteWorkout = (id: string) => {
    deleteWorkout(id);
    setWorkouts(workouts.filter(w => w.id !== id));
    setDeleteConfirmId(null);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-blue-600 font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Workout History</h1>
                <p className="text-blue-100 text-sm mt-1">{workouts.length} workout{workouts.length !== 1 ? "s" : ""} recorded</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/workout/progress"
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
                >
                  📈 Progress
                </Link>
                <Link
                  href="/workout/new"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg font-medium"
                >
                  ➕ New Workout
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
                >
                  ← Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {workouts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No workouts yet</h2>
            <p className="text-gray-500 mb-6">Start your fitness journey by recording your first workout!</p>
            <Link
              href="/workout/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg font-medium"
            >
              ➕ Create First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => {
              const activeGroups = workout.muscleGroups.filter(g => g.exercises.length > 0);
              const totalExercises = activeGroups.reduce((t, g) => t + g.exercises.length, 0);

              return (
                <div
                  key={workout.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Card header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{formatDate(workout.date)}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/workout/details?id=${workout.id}`}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/workout/edit?id=${workout.id}`}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(workout.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Delete confirm */}
                  {deleteConfirmId === workout.id && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 text-sm font-medium mb-3">Delete this workout? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Delete Permanently
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-4 py-1.5 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="px-6 py-4 grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium mb-1">Exercises</p>
                      <p className="text-2xl font-bold text-blue-900">{totalExercises}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 text-center border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">Muscle Groups</p>
                      <p className="text-2xl font-bold text-purple-900">{activeGroups.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center border border-orange-100">
                      <p className="text-xs text-orange-600 font-medium mb-1">Calories</p>
                      <p className="text-2xl font-bold text-orange-900">{workout.totalCalories}</p>
                    </div>
                  </div>

                  {/* Muscle group badges */}
                  {activeGroups.length > 0 && (
                    <div className="px-6 pb-4 flex flex-wrap gap-2">
                      {activeGroups.map(group => (
                        <span
                          key={group.id}
                          className={`text-xs px-3 py-1 rounded-full font-medium border ${muscleColor(group.name)}`}
                        >
                          {group.name} ({group.exercises.length})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
