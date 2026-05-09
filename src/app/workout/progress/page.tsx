"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DEFAULT_PRESETS, getExercisePresets } from "../data/exercise-presets";
import { getWorkouts } from "../utils/storage";
import { WorkoutHistory, WeightExercise } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ExerciseProgress = {
  dates: string[];
  weights: number[];
  volumes: number[];
  oneRms: number[];
  oneRmWeights: number[];
  oneRmReps: number[];
};

type ExerciseHistory = {
  [key: string]: ExerciseProgress;
};

type PeriodOption = "4w" | "8w" | "12w" | "24w" | "all";

const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: "4w", label: "Last 4 weeks" },
  { value: "8w", label: "Last 8 weeks" },
  { value: "12w", label: "Last 12 weeks" },
  { value: "24w", label: "Last 24 weeks" },
  { value: "all", label: "All time" },
];

const getPeriodStartDate = (period: PeriodOption) => {
  if (period === "all") return null;
  const weeks = Number(period.replace("w", ""));
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7);
  return start;
};

const calculateOneRepMax = (weight: number, reps: number) => {
  if (!weight || !reps) return 0;
  // Requested formula: weight * reps / 40 + weight
  return Math.round(((weight * reps) / 40 + weight) * 10) / 10;
};

const formatDateLabel = (date?: string) => {
  if (!date) return "-";
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString();
};

export default function Progress() {
  const [muscleGroup, setMuscleGroup] = useState<keyof typeof DEFAULT_PRESETS>("chest");
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory>({});
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exercisePresets, setExercisePresets] = useState(DEFAULT_PRESETS);
  const [isClient, setIsClient] = useState(false);
  const [period, setPeriod] = useState<PeriodOption>("12w");
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);

  const formatTrend = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
  const trendColor = (value: number) => {
    if (value > 0) return "text-green-700";
    if (value < 0) return "text-red-700";
    return "text-gray-700";
  };

  useEffect(() => {
    setIsClient(true);
    setExercisePresets(getExercisePresets());
  }, []);

  // Keep presets in sync when returning to the tab or when storage changes
  useEffect(() => {
    if (!isClient) return;
    const refreshPresets = () => setExercisePresets(getExercisePresets());
    window.addEventListener("focus", refreshPresets);
    window.addEventListener("storage", refreshPresets);
    return () => {
      window.removeEventListener("focus", refreshPresets);
      window.removeEventListener("storage", refreshPresets);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const startDate = getPeriodStartDate(period);
    const workouts = getWorkouts().filter(workout => {
      if (!startDate) return true;
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate;
    });
    const history: ExerciseHistory = {};

    // Combine presets + any exercises found in workouts (to include custom names)
    const presetsForGroup = exercisePresets[muscleGroup] || [];
    const exerciseNameSet = new Set<string>(presetsForGroup);

    workouts.forEach((workout: WorkoutHistory) => {
      workout.muscleGroups.forEach(group => {
        if (group.id === muscleGroup) {
          group.exercises.forEach(exercise => {
            if (exercise.type === "weight") {
              exerciseNameSet.add(exercise.name);
            }
          });
        }
      });
    });

    const allExercises = Array.from(exerciseNameSet).sort((a, b) => a.localeCompare(b));

    // Initialize history with all preset exercises
    allExercises.forEach((exercise: string) => {
      history[exercise] = {
        dates: [],
        weights: [],
        volumes: [],
        oneRms: [],
        oneRmWeights: [],
        oneRmReps: []
      };
    });

    // Populate history with actual workout data
    workouts.forEach((workout: WorkoutHistory) => {
      workout.muscleGroups.forEach(group => {
        if (group.id === muscleGroup) {
          group.exercises.forEach(exercise => {
            if (exercise.type === 'weight' && history[exercise.name]) {
              const weightExercise = exercise as WeightExercise;
              // Calculate maximum weight for this exercise on this date
              const maxWeight = weightExercise.weight;
              const volume = weightExercise.weight * weightExercise.reps * (weightExercise.sets || 1);
              const oneRm = calculateOneRepMax(weightExercise.weight, weightExercise.reps);
              const oneRmWeight = weightExercise.weight;
              const oneRmReps = weightExercise.reps;

              // Find if this date already exists
              const existingDateIndex = history[exercise.name].dates.indexOf(workout.date);
              if (existingDateIndex >= 0) {
                // If date exists, keep the higher weight
                history[exercise.name].weights[existingDateIndex] = Math.max(
                  history[exercise.name].weights[existingDateIndex],
                  maxWeight
                );
                // Accumulate volume for the same day and keep highest 1RM
                history[exercise.name].volumes[existingDateIndex] =
                  (history[exercise.name].volumes[existingDateIndex] || 0) + volume;
                if (oneRm > (history[exercise.name].oneRms[existingDateIndex] || 0)) {
                  history[exercise.name].oneRms[existingDateIndex] = oneRm;
                  history[exercise.name].oneRmWeights[existingDateIndex] = oneRmWeight;
                  history[exercise.name].oneRmReps[existingDateIndex] = oneRmReps;
                }
              } else {
                // Add new date and weight
                history[exercise.name].dates.push(workout.date);
                history[exercise.name].weights.push(maxWeight);
                history[exercise.name].volumes.push(volume);
                history[exercise.name].oneRms.push(oneRm);
                history[exercise.name].oneRmWeights.push(oneRmWeight);
                history[exercise.name].oneRmReps.push(oneRmReps);
              }
            }
          });
        }
      });
    });

    // Sort by date for each exercise
    Object.keys(history).forEach(exerciseName => {
      const combined = history[exerciseName].dates.map((date, index) => ({
        date,
        weight: history[exerciseName].weights[index],
        volume: history[exerciseName].volumes[index] || 0,
        oneRm: history[exerciseName].oneRms[index] || 0,
        oneRmWeight: history[exerciseName].oneRmWeights[index] || 0,
        oneRmReps: history[exerciseName].oneRmReps[index] || 0,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      history[exerciseName] = {
        dates: combined.map(item => item.date),
        weights: combined.map(item => item.weight),
        volumes: combined.map(item => item.volume),
        oneRms: combined.map(item => item.oneRm),
        oneRmWeights: combined.map(item => item.oneRmWeight),
        oneRmReps: combined.map(item => item.oneRmReps),
      };
    });

    setExerciseHistory(history);
    setSelectedExercise("");
    setAvailableExercises(allExercises);
  }, [muscleGroup, exercisePresets, isClient, period]);

  const chartData = {
    labels: selectedExercise ? exerciseHistory[selectedExercise]?.dates.map(date =>
      new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    ) : [],
    datasets: [
      {
        label: `${selectedExercise} Weight Progress (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.weights : [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true
      },
      {
        label: `${selectedExercise} Volume (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.volumes : [],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        tension: 0.1,
        fill: true,
        yAxisID: "y1"
      },
      {
        label: `${selectedExercise} 1RM (est. kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.oneRms : [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        tension: 0.1,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Progress Over Time'
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Weight / 1RM (kg)'
        },
        beginAtZero: false,
        ticks: {
          maxTicksLimit: 5
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0
        }
      },
      y1: {
        display: selectedExercise
          ? !!exerciseHistory[selectedExercise]?.volumes?.length
          : false,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Volume (kg)'
        },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 5
        }
      }
    }
  };

  const getProgressStats = () => {
    if (!selectedExercise || !exerciseHistory[selectedExercise]?.weights.length) {
      return null;
    }

    const history = exerciseHistory[selectedExercise];
    const weights = history.weights;
    const volumes = history.volumes;
    const oneRms = history.oneRms;
    const oneRmWeights = history.oneRmWeights;
    const oneRmReps = history.oneRmReps;
    const dates = history.dates;

    const maxWeight = Math.max(...weights);
    const maxVolume = volumes.length ? Math.max(...volumes) : 0;
    const maxOneRm = oneRms.length ? Math.max(...oneRms) : 0;

    const pbWeightIndex = weights.indexOf(maxWeight);
    const pbVolumeIndex = volumes.indexOf(maxVolume);
    const pbOneRmIndex = oneRms.indexOf(maxOneRm);

    const weightTrend = weights.length > 1 ? weights[weights.length - 1] - weights[weights.length - 2] : 0;
    const volumeTrend = volumes.length > 1 ? volumes[volumes.length - 1] - volumes[volumes.length - 2] : 0;
    const oneRmTrend = oneRms.length > 1 ? oneRms[oneRms.length - 1] - oneRms[oneRms.length - 2] : 0;

    return {
      maxWeight,
      maxVolume,
      maxOneRm,
      weightTrend,
      volumeTrend,
      oneRmTrend,
      lastWeight: weights[weights.length - 1],
      lastVolume: volumes[volumes.length - 1] || 0,
      lastOneRm: oneRms[oneRms.length - 1] || 0,
      workoutCount: weights.length,
      pbWeightDate: dates[pbWeightIndex],
      pbVolumeDate: dates[pbVolumeIndex],
      pbOneRmDate: dates[pbOneRmIndex],
      pbOneRmWeight: oneRmWeights[pbOneRmIndex] || 0,
      pbOneRmReps: oneRmReps[pbOneRmIndex] || 0,
    };
  };

  const stats = getProgressStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Exercise Progress</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Muscle Group
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => {
                  setMuscleGroup(e.target.value as keyof typeof DEFAULT_PRESETS);
                  setSelectedExercise("");
                }}
                className="w-full border rounded-md px-3 py-2"
              >
                {Object.keys(DEFAULT_PRESETS).map(group => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Exercise</option>
                {isClient && availableExercises.map((exercise: string) => (
                  <option
                    key={exercise}
                    value={exercise}
                    disabled={!exerciseHistory[exercise]?.weights.length}
                  >
                    {exercise} {!exerciseHistory[exercise]?.weights.length ? "(No data)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                className="w-full border rounded-md px-3 py-2"
              >
                {PERIOD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Applies to charts and personal bests.
              </p>
            </div>
          </div>

          {selectedExercise && exerciseHistory[selectedExercise]?.weights.length > 0 ? (
            <div>
              <div className="mb-6 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="min-w-[520px] h-64 sm:h-72">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {stats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-red-600">Max Weight (PB)</h3>
                      <p className="text-2xl font-bold text-red-900">
                        {stats.maxWeight.toFixed(1)} kg
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        On {formatDateLabel(stats.pbWeightDate)}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-purple-600">Max Volume</h3>
                      <p className="text-2xl font-bold text-purple-900">
                        {Math.round(stats.maxVolume)} kg
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        On {formatDateLabel(stats.pbVolumeDate)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-green-600">Max 1RM (est.)</h3>
                      <p className="text-2xl font-bold text-green-900">
                        {stats.maxOneRm.toFixed(1)} kg
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        ({stats.pbOneRmWeight.toFixed(1)} kg x {stats.pbOneRmReps} reps)
                      </p>
                      <p className="text-xs text-green-700">
                        On {formatDateLabel(stats.pbOneRmDate)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-600">Trend (last 2 sessions)</h3>
                      <div className="space-y-1 text-sm">
                        <p className={trendColor(stats.weightTrend)}>
                          Weight: {formatTrend(stats.weightTrend)} kg
                        </p>
                        <p className={trendColor(stats.volumeTrend)}>
                          Volume: {formatTrend(stats.volumeTrend)} kg
                        </p>
                        <p className={trendColor(stats.oneRmTrend)}>
                          1RM: {formatTrend(stats.oneRmTrend)} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h4 className="text-sm font-medium text-gray-700">Last Session</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {stats.lastWeight.toFixed(1)} kg
                      </p>
                      <p className="text-sm text-gray-600">
                        Volume: {Math.round(stats.lastVolume)} kg
                      </p>
                      <p className="text-sm text-gray-600">
                        1RM est.: {stats.lastOneRm.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="text-sm font-medium text-gray-700">Sessions in period</h4>
                      <p className="text-lg font-semibold text-gray-900">{stats.workoutCount}</p>
                      <p className="text-xs text-gray-600">For selected exercise</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <h4 className="text-sm font-medium text-amber-700">Personal Best Highlights</h4>
                      <p className="text-sm text-amber-800">
                        Weight PB: {stats.maxWeight.toFixed(1)} kg ({formatDateLabel(stats.pbWeightDate)})
                      </p>
                      <p className="text-sm text-amber-800">
                        Volume PB: {Math.round(stats.maxVolume)} kg ({formatDateLabel(stats.pbVolumeDate)})
                      </p>
                      <p className="text-sm text-amber-800">
                        1RM PB: {stats.maxOneRm.toFixed(1)} kg ({stats.pbOneRmWeight.toFixed(1)} kg x {stats.pbOneRmReps} reps) ({formatDateLabel(stats.pbOneRmDate)})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {selectedExercise
                ? "No weight data available for the selected exercise. Start recording workouts to see your progress!"
                : "Select an exercise to view progress"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
