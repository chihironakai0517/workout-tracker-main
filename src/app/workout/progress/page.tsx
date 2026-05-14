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
import { DEFAULT_PRESETS, getExercisePresets, ExercisePresets } from "../data/exercise-presets";
import { getWorkouts } from "../utils/storage";
import { WorkoutHistory, WeightExercise } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type ExerciseProgress = {
  dates: string[];
  weights: number[];
  volumes: number[];
  oneRms: number[];
  oneRmWeights: number[];
  oneRmReps: number[];
};

type ExerciseHistory = { [key: string]: ExerciseProgress };
type PeriodOption = "4w" | "8w" | "12w" | "24w" | "all";

const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: "4w", label: "4w" },
  { value: "8w", label: "8w" },
  { value: "12w", label: "12w" },
  { value: "24w", label: "24w" },
  { value: "all", label: "All" },
];

const MUSCLE_GROUPS = Object.keys(DEFAULT_PRESETS);

const getPeriodStartDate = (period: PeriodOption) => {
  if (period === "all") return null;
  const weeks = Number(period.replace("w", ""));
  const start = new Date();
  start.setDate(start.getDate() - weeks * 7);
  return start;
};

const calculateOneRepMax = (weight: number, reps: number) => {
  if (!weight || !reps) return 0;
  return Math.round(((weight * reps) / 40 + weight) * 10) / 10;
};

const formatDateLabel = (date?: string) => {
  if (!date) return "-";
  const parts = date.split('-').map(Number);
  if (parts.length !== 3) return date;
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString();
};

export default function Progress() {
  const [muscleGroup, setMuscleGroup] = useState<keyof typeof DEFAULT_PRESETS>("chest");
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory>({});
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exercisePresets, setExercisePresets] = useState<ExercisePresets>(DEFAULT_PRESETS as unknown as ExercisePresets);
  const [isClient, setIsClient] = useState(false);
  const [period, setPeriod] = useState<PeriodOption>("12w");
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);

  const formatTrend = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
  const trendColor = (value: number) => {
    if (value > 0) return "text-green-600 font-semibold";
    if (value < 0) return "text-red-600 font-semibold";
    return "text-gray-600";
  };
  const trendIcon = (value: number) => value > 0 ? "↑" : value < 0 ? "↓" : "→";

  useEffect(() => {
    setIsClient(true);
    setExercisePresets(getExercisePresets());
  }, []);

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
      return new Date(workout.date) >= startDate;
    });
    const history: ExerciseHistory = {};

    const presetsForGroup = exercisePresets[muscleGroup] || [];
    const exerciseNameSet = new Set<string>(presetsForGroup);

    workouts.forEach((workout: WorkoutHistory) => {
      workout.muscleGroups.forEach(group => {
        if (group.id === muscleGroup) {
          group.exercises.forEach(exercise => {
            if (exercise.type === "weight") exerciseNameSet.add(exercise.name);
          });
        }
      });
    });

    const allExercises = Array.from(exerciseNameSet).sort((a, b) => a.localeCompare(b));

    allExercises.forEach((exercise: string) => {
      history[exercise] = { dates: [], weights: [], volumes: [], oneRms: [], oneRmWeights: [], oneRmReps: [] };
    });

    workouts.forEach((workout: WorkoutHistory) => {
      workout.muscleGroups.forEach(group => {
        if (group.id === muscleGroup) {
          group.exercises.forEach(exercise => {
            if (exercise.type === 'weight' && history[exercise.name]) {
              const weightExercise = exercise as WeightExercise;
              const maxWeight = weightExercise.weight;
              const volume = weightExercise.weight * weightExercise.reps * (weightExercise.sets || 1);
              const oneRm = calculateOneRepMax(weightExercise.weight, weightExercise.reps);

              const existingDateIndex = history[exercise.name].dates.indexOf(workout.date);
              if (existingDateIndex >= 0) {
                history[exercise.name].weights[existingDateIndex] = Math.max(history[exercise.name].weights[existingDateIndex], maxWeight);
                history[exercise.name].volumes[existingDateIndex] = (history[exercise.name].volumes[existingDateIndex] || 0) + volume;
                if (oneRm > (history[exercise.name].oneRms[existingDateIndex] || 0)) {
                  history[exercise.name].oneRms[existingDateIndex] = oneRm;
                  history[exercise.name].oneRmWeights[existingDateIndex] = weightExercise.weight;
                  history[exercise.name].oneRmReps[existingDateIndex] = weightExercise.reps;
                }
              } else {
                history[exercise.name].dates.push(workout.date);
                history[exercise.name].weights.push(maxWeight);
                history[exercise.name].volumes.push(volume);
                history[exercise.name].oneRms.push(oneRm);
                history[exercise.name].oneRmWeights.push(weightExercise.weight);
                history[exercise.name].oneRmReps.push(weightExercise.reps);
              }
            }
          });
        }
      });
    });

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
        label: `Weight (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.weights : [],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `1RM est. (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.oneRms : [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `Volume (kg)`,
        data: selectedExercise ? exerciseHistory[selectedExercise]?.volumes : [],
        borderColor: "rgb(251, 146, 60)",
        backgroundColor: "rgba(251, 146, 60, 0.08)",
        tension: 0.3,
        fill: true,
        yAxisID: "y1",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 16 } },
      title: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: 'Weight / 1RM (kg)' },
        beginAtZero: false,
        ticks: { maxTicksLimit: 5 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { autoSkip: true, maxTicksLimit: 6, maxRotation: 0, minRotation: 0 },
        grid: { display: false },
      },
      y1: {
        display: selectedExercise ? !!exerciseHistory[selectedExercise]?.volumes?.length : false,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Volume (kg)' },
        beginAtZero: true,
        ticks: { maxTicksLimit: 5 },
      }
    }
  };

  const getProgressStats = () => {
    if (!selectedExercise || !exerciseHistory[selectedExercise]?.weights.length) return null;

    const history = exerciseHistory[selectedExercise];
    const { weights, volumes, oneRms, oneRmWeights, oneRmReps, dates } = history;

    const maxWeight = Math.max(...weights);
    const maxVolume = volumes.length ? Math.max(...volumes) : 0;
    const maxOneRm = oneRms.length ? Math.max(...oneRms) : 0;

    const pbWeightIndex = weights.indexOf(maxWeight);
    const pbVolumeIndex = volumes.indexOf(maxVolume);
    const pbOneRmIndex = oneRms.indexOf(maxOneRm);

    return {
      maxWeight,
      maxVolume,
      maxOneRm,
      weightTrend: weights.length > 1 ? weights[weights.length - 1] - weights[weights.length - 2] : 0,
      volumeTrend: volumes.length > 1 ? volumes[volumes.length - 1] - volumes[volumes.length - 2] : 0,
      oneRmTrend: oneRms.length > 1 ? oneRms[oneRms.length - 1] - oneRms[oneRms.length - 2] : 0,
      lastWeight: weights[weights.length - 1],
      lastVolume: volumes[volumes.length - 1] || 0,
      lastOneRm: oneRms[oneRms.length - 1] || 0,
      workoutCount: weights.length,
      pbWeightDate: pbWeightIndex >= 0 ? dates[pbWeightIndex] : undefined,
      pbVolumeDate: pbVolumeIndex >= 0 ? dates[pbVolumeIndex] : undefined,
      pbOneRmDate: pbOneRmIndex >= 0 ? dates[pbOneRmIndex] : undefined,
      pbOneRmWeight: pbOneRmIndex >= 0 ? (oneRmWeights[pbOneRmIndex] || 0) : 0,
      pbOneRmReps: pbOneRmIndex >= 0 ? (oneRmReps[pbOneRmIndex] || 0) : 0,
    };
  };

  const stats = getProgressStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Exercise Progress</h1>
                <p className="text-blue-100 text-sm mt-1">Track personal bests and trends over time</p>
              </div>
              <Link
                href="/"
                className="self-start sm:self-auto px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Muscle group */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Muscle Group</label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-xl p-1">
                {MUSCLE_GROUPS.map(group => (
                  <button
                    key={group}
                    onClick={() => { setMuscleGroup(group as keyof typeof DEFAULT_PRESETS); setSelectedExercise(""); }}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                      muscleGroup === group
                        ? "bg-white text-blue-700 shadow-sm font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Exercise</label>
              <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-gray-50"
              >
                <option value="">Select Exercise</option>
                {isClient && availableExercises.map((exercise: string) => (
                  <option key={exercise} value={exercise} disabled={!exerciseHistory[exercise]?.weights.length}>
                    {exercise}{!exerciseHistory[exercise]?.weights.length ? " (No data)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Period</label>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {PERIOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPeriod(option.value)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      period === option.value
                        ? "bg-white text-blue-700 shadow-sm font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart + Stats */}
        {selectedExercise && exerciseHistory[selectedExercise]?.weights.length > 0 ? (
          <div className="space-y-4">
            {/* Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">{selectedExercise} — Progress Chart</h2>
              <div className="overflow-x-auto pb-2 -mx-2 px-2">
                <div className="min-w-[520px] h-64 sm:h-80">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {stats && (
              <>
                {/* Personal Bests */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-5">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Max Weight (PB)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.maxWeight.toFixed(1)}<span className="text-base font-normal text-gray-500 ml-1">kg</span></p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateLabel(stats.pbWeightDate)}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-5">
                    <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">Max Volume (PB)</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.round(stats.maxVolume)}<span className="text-base font-normal text-gray-500 ml-1">kg</span></p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateLabel(stats.pbVolumeDate)}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-5">
                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-1">Max 1RM est. (PB)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.maxOneRm.toFixed(1)}<span className="text-base font-normal text-gray-500 ml-1">kg</span></p>
                    <p className="text-xs text-gray-400 mt-1">{stats.pbOneRmWeight.toFixed(1)} kg × {stats.pbOneRmReps} reps</p>
                    <p className="text-xs text-gray-400">{formatDateLabel(stats.pbOneRmDate)}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-5">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.workoutCount}</p>
                    <p className="text-xs text-gray-400 mt-1">in selected period</p>
                  </div>
                </div>

                {/* Trends + Last session */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Trend (last 2 sessions)</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Weight", value: stats.weightTrend, unit: "kg" },
                        { label: "Volume", value: stats.volumeTrend, unit: "kg" },
                        { label: "1RM est.", value: stats.oneRmTrend, unit: "kg" },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className={`text-sm flex items-center gap-1 ${trendColor(value)}`}>
                            {trendIcon(value)} {formatTrend(value)} {unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Last Session</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Weight", value: `${stats.lastWeight.toFixed(1)} kg` },
                        { label: "Volume", value: `${Math.round(stats.lastVolume)} kg` },
                        { label: "1RM est.", value: `${stats.lastOneRm.toFixed(1)} kg` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className="text-sm font-semibold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {selectedExercise ? "No data for this exercise yet" : "Select an exercise to view progress"}
            </h3>
            <p className="text-sm text-gray-400">
              {selectedExercise ? "Start recording workouts to see your progress charts." : "Choose a muscle group and exercise above."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
