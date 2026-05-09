"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWorkoutSummaries, getWorkouts, getTimerSettings, saveTimerSettings, TimerSettings } from './workout/utils/storage';
import { WorkoutSummary, WorkoutHistory, Exercise } from './workout/types';

// Health tracking icons using heroicons paths
const HEALTH_LINKS = [
  {
    href: "/health/measurements",
    title: "Body Stats",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    description: "Track weight, body fat, and measurements"
  },
  {
    href: "/health/meal",
    title: "Nutrition",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-green-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
      </svg>
    ),
    description: "Log meals and track macros"
  },
  {
    href: "/health/goals",
    title: "Goals",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    description: "Set and track your targets"
  },
  {
    href: "/health/summary",
    title: "Analytics",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-3 text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    description: "View your progress and insights"
  }
];

const formatDateLocal = (date: Date) => {
  // YYYY-MM-DD in local time (avoids UTCずれ)
  return date.toLocaleDateString('en-CA');
};

export default function Home() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [workoutMap, setWorkoutMap] = useState<Map<string, WorkoutHistory[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(new Date());
  const [monthCells, setMonthCells] = useState<{ date: Date; inMonth: boolean; hasWorkout: boolean; isToday: boolean; isSelected: boolean; }[]>([]);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({ vibrationEnabled: true, soundEnabled: true });

  const buildMonthGrid = (cursor: Date) => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startDay = start.getDay();
    const totalDays = end.getDate();
    const cells: { date: Date; inMonth: boolean; hasWorkout: boolean; isToday: boolean; isSelected: boolean; }[] = [];

    // Leading blanks (previous month)
    for (let i = 0; i < startDay; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() - (startDay - i));
      const key = formatDateLocal(d);
      cells.push({
        date: d,
        inMonth: false,
        hasWorkout: workoutMap.has(key),
        isToday: key === formatDateLocal(new Date()),
        isSelected: key === formatDateLocal(selectedDate),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dayDate = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const key = formatDateLocal(dayDate);
      cells.push({
        date: dayDate,
        inMonth: true,
        hasWorkout: workoutMap.has(key),
        isToday: key === formatDateLocal(new Date()),
        isSelected: key === formatDateLocal(selectedDate),
      });
    }

    // Trailing blanks to fill last week
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() + i + 1);
      const key = formatDateLocal(d);
      cells.push({
        date: d,
        inMonth: false,
        hasWorkout: workoutMap.has(key),
        isToday: key === formatDateLocal(new Date()),
        isSelected: key === formatDateLocal(selectedDate),
      });
    }

    return cells;
  };

  useEffect(() => {
    const summaries = getWorkoutSummaries();
    setWorkouts(summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const data = getWorkouts();
    const map = new Map<string, WorkoutHistory[]>();
    data.forEach(w => {
      const key = w.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(w);
    });
    setWorkoutMap(map);
    setMonthCells(buildMonthGrid(new Date()));

    // Load timer settings
    setTimerSettings(getTimerSettings());
  }, []);

  useEffect(() => {
    setMonthCells(buildMonthGrid(monthCursor));
  }, [selectedDate, workoutMap, monthCursor]);

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: { [key: string]: string } = {
      'Chest': 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
      'Back': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
      'Shoulders': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
      'Arms': 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200',
      'Legs': 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200',
      'Abs': 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200',
      'Cardio': 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border-cyan-200'
    };
    return colors[muscleGroup] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
  };

  const summarizeWorkouts = (entries: WorkoutHistory[]) => {
    let exerciseCount = 0;
    let setCount = 0;
    entries.forEach(workout => {
      workout.muscleGroups.forEach(group => {
        group.exercises.forEach(exercise => {
          exerciseCount += 1;
          if ((exercise as any).sets) {
            setCount += (exercise as any).sets;
          } else {
            setCount += 1;
          }
        });
      });
    });
    return { exerciseCount, setCount };
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const goToPrevMonth = () => {
    const next = new Date(monthCursor);
    next.setMonth(monthCursor.getMonth() - 1);
    setMonthCursor(next);
  };

  const goToNextMonth = () => {
    const next = new Date(monthCursor);
    next.setMonth(monthCursor.getMonth() + 1);
    setMonthCursor(next);
  };

  const handleSaveTimerSettings = (newSettings: TimerSettings) => {
    setTimerSettings(newSettings);
    saveTimerSettings(newSettings);
    setShowTimerSettings(false);
  };

  const formatExerciseDetail = (exercise: Exercise) => {
    if (exercise.type === 'weight') {
      return `${exercise.weight} kg x ${exercise.reps} reps`;
    }
    return `${exercise.duration} min, ${exercise.distance} km, ${exercise.calories} kcal`;
  };

  const selectedDateKey = formatDateLocal(selectedDate);
  const selectedEntries = workoutMap.get(selectedDateKey) || [];
  const selectedSummary = summarizeWorkouts(selectedEntries);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Fitness Tracker
          </h1>
          <p className="text-gray-600 text-lg">Track your workouts, nutrition, and fitness goals</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
        {/* Workout Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Workouts</h2>
                <p className="text-blue-100 text-sm">Plan and track your training sessions</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowTimerSettings(true)}
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  ⚙️ Settings
                </button>
                <Link
                  href="/workout/sync"
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  🔄 Sync
                </Link>
                <Link
                  href="/workout/progress"
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  📈 Progress
                </Link>
                <Link
                  href="/workout/history"
                  className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  📚 History
                </Link>
                <Link
                  href="/workout/new"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                >
                  ➕ New Workout
                </Link>
              </div>
            </div>
          </div>

            {/* Schedule: Mini month + week detail */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">Schedule</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPrevMonth}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      ←
                    </button>
                    <div className="text-lg font-semibold text-gray-900" suppressHydrationWarning>
                      {monthCursor.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      →
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-2 font-medium">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthCells.map((cell, idx) => {
                      const key = `${formatDateLocal(cell.date)}-${idx}`;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectDate(cell.date)}
                          className={`relative py-3 text-sm rounded-lg transition-all duration-200 hover:scale-105
                            ${cell.inMonth ? 'text-gray-900 hover:bg-blue-100' : 'text-gray-400'}
                            ${cell.isSelected ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white'}
                            ${cell.hasWorkout ? 'ring-2 ring-blue-200' : ''}
                          `}
                        >
                          <span className="font-medium">{cell.date.getDate()}</span>
                          {cell.hasWorkout && !cell.isSelected && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                          )}
                          {cell.isToday && !cell.isSelected && (
                            <span className="absolute top-1 right-1 text-xs text-blue-500 font-bold">●</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Selected Day</h4>
                      <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {selectedEntries.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      <div className="flex justify-between text-sm text-gray-700 bg-white/60 px-3 py-2 rounded-lg">
                        <span className="font-medium">Workouts: {selectedEntries.length}</span>
                        <span className="font-medium">Exercises: {selectedSummary.exerciseCount}</span>
                        <span className="font-medium">Sets: {selectedSummary.setCount}</span>
                      </div>
                      {selectedEntries.map((workout, idx) => {
                        const groups = workout.muscleGroups.filter(g => g.exercises.length > 0);
                        return (
                          <div key={`${workout.id}-${idx}`} className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-gray-900 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Workout {idx + 1}
                              </span>
                              <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                {workout.totalCalories} kcal
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {groups.length > 0 ? groups.map((group, gidx) => (
                                <span key={gidx} className={`text-xs px-3 py-1 rounded-full font-medium ${getMuscleGroupColor(group.name)} shadow-sm`}>
                                  {group.name} ({group.exercises.length})
                                </span>
                              )) : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">No exercises</span>}
                            </div>
                            {groups.length > 0 && (
                              <div className="space-y-3">
                                {groups.map((group, gidx) => (
                                  <div key={`${workout.id}-${gidx}`} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                                    <div className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                      {group.name}
                                    </div>
                                    <div className="space-y-2">
                                      {group.exercises.map((ex, eidx) => (
                                        <div key={`${workout.id}-${gidx}-${eidx}`} className="text-xs text-gray-700 flex justify-between items-center bg-white/50 px-2 py-1 rounded">
                                          <span className="font-medium">{ex.name}</span>
                                          <span className="text-gray-600">{formatExerciseDetail(ex as Exercise)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-gray-500 font-medium mb-2">No workout recorded</h4>
                      <p className="text-sm text-gray-400">Start your fitness journey today!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Health Tracking</h2>
                  <p className="text-green-100 text-sm">Monitor your nutrition and body metrics</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {HEALTH_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 hover:from-gray-50 hover:to-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 p-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                        {link.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{link.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Settings Modal */}
      {showTimerSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h3 className="text-xl font-bold text-white">Timer Settings</h3>
              <p className="text-blue-100 text-sm mt-1">Customize your workout notifications</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    🔊 Sound Notification
                  </label>
                  <p className="text-xs text-gray-600 mt-1">Play sound when timer completes</p>
                </div>
                <button
                  onClick={() => setTimerSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                    timerSettings.soundEnabled ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      timerSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    📳 Vibration
                  </label>
                  <p className="text-xs text-gray-600 mt-1">Vibrate device when timer completes</p>
                </div>
                <button
                  onClick={() => setTimerSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                    timerSettings.vibrationEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      timerSettings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-6 bg-gray-50">
              <button
                onClick={() => handleSaveTimerSettings(timerSettings)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowTimerSettings(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
