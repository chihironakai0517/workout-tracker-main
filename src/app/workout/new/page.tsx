"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getExercisePresets, DEFAULT_PRESETS } from "../data/exercise-presets";
import { Exercise, WeightExercise, CardioExercise, MuscleGroup, WorkoutHistory } from "../types";
import { METS_VALUES, calculateCalories } from "../utils/calories";
import { v4 as uuidv4 } from "uuid";
import { saveWorkout, getLastWorkout } from "../utils/storage";
import { addCustomExercise, removeCustomExercise } from "../data/exercise-presets";
import { getLatestMeasurement } from "../../health/utils/storage";
import Timer from "../components/Timer";
import RestTimer from "../components/RestTimer";

const DEFAULT_WEIGHT = 70;
const getTodayLocalDate = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

const muscleGroupsData = [
  { id: "chest", name: "Chest", exercises: [] },
  { id: "back", name: "Back", exercises: [] },
  { id: "shoulders", name: "Shoulders", exercises: [] },
  { id: "arms", name: "Arms", exercises: [] },
  { id: "legs", name: "Legs", exercises: [] },
  { id: "abs", name: "Abs", exercises: [] },
  { id: "cardio", name: "Cardio", exercises: [] },
];

const isCardioExercise = (exercise: Exercise): exercise is CardioExercise => {
  return exercise.type === "cardio";
};

const createInitialExercise = (isCardio: boolean): Exercise => {
  return isCardio
    ? {
        type: "cardio",
        name: "",
        duration: 0,
        distance: 0,
        calories: 0,
      }
    : {
        type: "weight",
        name: "",
        weight: 0,
        reps: 0,
        sets: 1,
      };
};

export default function NewWorkout() {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(muscleGroupsData);
  const [activeGroup, setActiveGroup] = useState<string>("chest");
  const [newExercise, setNewExercise] = useState<Exercise>(() => createInitialExercise(false));
  const [cardioInputs, setCardioInputs] = useState({
    duration: 0,
    distance: 0,
  });
  const [workoutDate, setWorkoutDate] = useState<string>(getTodayLocalDate());
  const [showCustomExerciseInput, setShowCustomExerciseInput] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [lastWorkout, setLastWorkout] = useState<WorkoutHistory | null>(null);
  const [userWeight, setUserWeight] = useState<number>(DEFAULT_WEIGHT);
  const [showTimer, setShowTimer] = useState(false);
  const [exercisePresets, setExercisePresets] = useState(DEFAULT_PRESETS);
  const [isClient, setIsClient] = useState(false);
  const [showCustomExerciseManager, setShowCustomExerciseManager] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(180); // 3 minutes default

  useEffect(() => {
    setIsClient(true);
    setExercisePresets(getExercisePresets());

    const last = getLastWorkout();
    setLastWorkout(last);

    const latestMeasurement = getLatestMeasurement();
    if (latestMeasurement) {
      setUserWeight(latestMeasurement.weight);
    }
  }, []);

  useEffect(() => {
    if (!isCardioExercise(newExercise) || !cardioInputs.duration || !cardioInputs.distance) return;

    const { name } = newExercise;
    const { duration, distance } = cardioInputs;

    if (name && METS_VALUES[name as keyof typeof METS_VALUES]) {
      const speedKmH = (distance / (duration / 60));
      const mets = METS_VALUES[name as keyof typeof METS_VALUES].calculate(speedKmH);
      const calories = calculateCalories(mets, duration, userWeight);

      setNewExercise(prev => {
        if (!isCardioExercise(prev)) return prev;
        return {
          ...prev,
          duration,
          distance,
          calories,
        };
      });
    }
  }, [cardioInputs, newExercise.name, userWeight]);

  const addExercise = (groupId: string) => {
    if (!newExercise.name) return;

    let exerciseToAdd: Exercise;

    if (newExercise.type === "cardio") {
      exerciseToAdd = {
        ...newExercise,
        duration: cardioInputs.duration,
        distance: cardioInputs.distance,
        calories: Math.round(cardioInputs.duration * 8), // Rough estimate
      } as CardioExercise;
    } else {
      exerciseToAdd = newExercise as WeightExercise;
    }

    setMuscleGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, exercises: [...group.exercises, { ...exerciseToAdd }] }
          : group
      )
    );

    const isCardio = groupId === "cardio";

    // Keep the exercise name but reset other values
    if (isCardio) {
      setNewExercise(prev => ({
        ...prev,
        duration: 0,
        distance: 0,
        calories: 0,
      }));
      setCardioInputs({ duration: 0, distance: 0 });
    } else {
      setNewExercise(prev => ({
        ...prev,
        weight: 0,
        reps: 0,
      }));
    }

    // Start rest timer for weight exercises (not cardio)
    if (!isCardio) {
      setShowRestTimer(true);
    } else {
      setShowTimer(true);
    }
  };

  const removeExercise = (groupId: string, index: number) => {
    setMuscleGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              exercises: group.exercises.filter((_, i) => i !== index),
            }
          : group
      )
    );
  };

  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    const isCardio = groupId === "cardio";
    setNewExercise(createInitialExercise(isCardio));
    if (isCardio) {
      setCardioInputs({ duration: 0, distance: 0 });
    }
  };

  const handleSaveWorkout = () => {
    const totalCalories = muscleGroups
      .flatMap(group => group.exercises)
      .reduce((total: number, exercise: Exercise) => {
        if (exercise.type === "cardio") {
          return total + exercise.calories;
        }
        return total;
      }, 0);

    const workout: WorkoutHistory = {
      id: uuidv4(),
      date: workoutDate,
      muscleGroups,
      totalCalories,
    };

    saveWorkout(workout);
    window.location.href = "/";
  };

  const handleAddCustomExercise = () => {
    if (customExerciseName.trim()) {
      const muscleGroupKey = activeGroup as keyof typeof DEFAULT_PRESETS;
      addCustomExercise(muscleGroupKey, customExerciseName.trim());
      setCustomExerciseName("");
      setShowCustomExerciseInput(false);
      setExercisePresets(getExercisePresets());
    }
  };

  const handleRemoveCustomExercise = (exercise: string) => {
    const muscleGroupKey = activeGroup as keyof typeof DEFAULT_PRESETS;
    removeCustomExercise(muscleGroupKey, exercise);
    setExercisePresets(getExercisePresets());
  };

  const isCustomExercise = (exercise: string) => {
    const muscleGroupKey = activeGroup as keyof typeof DEFAULT_PRESETS;
    const defaultExercises = DEFAULT_PRESETS[muscleGroupKey] as readonly string[];
    return !defaultExercises.includes(exercise);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">New Workout</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Rest Timer Settings */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rest Timer Settings</h3>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-700">Rest Duration:</label>
              <select
                value={restDuration}
                onChange={(e) => setRestDuration(Number(e.target.value))}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value={60}>1 minute</option>
                <option value={90}>1.5 minutes</option>
                <option value={120}>2 minutes</option>
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
              <span className="text-xs text-gray-500">
                (Auto-starts after adding weight exercises)
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Date
            </label>
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          {lastWorkout && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Previous Workout ({new Date(lastWorkout.date).toLocaleDateString()})
              </h3>
              <div className="text-sm text-gray-600">
                <p>Total Calories: {lastWorkout.totalCalories} kcal</p>
                <p>
                  Exercise Count:{" "}
                  {lastWorkout.muscleGroups.reduce(
                    (total: number, group: MuscleGroup) => total + group.exercises.length,
                    0
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Group
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {muscleGroupsData.map(group => (
                <button
                  key={group.id}
                  onClick={() => handleGroupChange(group.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeGroup === group.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Exercise
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomExerciseInput(!showCustomExerciseInput)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  {showCustomExerciseInput ? "Cancel" : "Add Custom Exercise"}
                </button>
                <button
                  onClick={() => setShowCustomExerciseManager(!showCustomExerciseManager)}
                  className="text-sm text-green-500 hover:text-green-600"
                >
                  {showCustomExerciseManager ? "Hide Manager" : "Manage Custom Exercises"}
                </button>
              </div>
            </div>

            {showCustomExerciseManager && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Custom Exercises for {muscleGroupsData.find(g => g.id === activeGroup)?.name}
                </h4>
                {isClient && (
                  <div className="space-y-2">
                    {exercisePresets[activeGroup as keyof typeof DEFAULT_PRESETS]
                      .filter((exercise: string) => isCustomExercise(exercise))
                      .map((exercise: string) => (
                        <div key={exercise} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm">{exercise}</span>
                          <button
                            onClick={() => handleRemoveCustomExercise(exercise)}
                            className="text-xs text-red-500 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    {exercisePresets[activeGroup as keyof typeof DEFAULT_PRESETS]
                      .filter((exercise: string) => isCustomExercise(exercise))
                      .length === 0 && (
                      <p className="text-sm text-gray-500">No custom exercises for this muscle group.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {showCustomExerciseInput ? (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Enter new exercise name"
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                  onClick={handleAddCustomExercise}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newExercise.name}
                onChange={e =>
                  setNewExercise(prev => ({ ...prev, name: e.target.value }))
                }
                className="border rounded-md px-3 py-2"
              >
                <option value="">Select Exercise</option>
                {isClient && exercisePresets[activeGroup as keyof typeof DEFAULT_PRESETS].map(
                  (exercise: string) => (
                    <option key={exercise} value={exercise}>
                      {exercise} {isCustomExercise(exercise) ? '(Custom)' : ''}
                    </option>
                  )
                )}
              </select>

              {activeGroup === "cardio" ? (
                <>
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={cardioInputs.duration || ""}
                    onChange={e =>
                      setCardioInputs(prev => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Distance (km)"
                    value={cardioInputs.distance || ""}
                    onChange={e =>
                      setCardioInputs(prev => ({
                        ...prev,
                        distance: Number(e.target.value),
                      }))
                    }
                    className="border rounded-md px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={isCardioExercise(newExercise) ? newExercise.calories : 0}
                    disabled
                    className="border rounded-md px-3 py-2 bg-gray-50"
                  />
                  {cardioInputs.duration > 0 && cardioInputs.distance > 0 && (
                    <div className="col-span-4 text-sm text-gray-600">
                      Speed: {(cardioInputs.distance / (cardioInputs.duration / 60)).toFixed(1)} km/h
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={(newExercise as WeightExercise).weight || ""}
                      onChange={e =>
                        setNewExercise(prev => ({
                          ...(prev as WeightExercise),
                          weight: Number(e.target.value),
                        }))
                      }
                      className="border rounded-md px-3 py-2 flex-1"
                    />
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() =>
                          setNewExercise(prev => ({
                            ...(prev as WeightExercise),
                            weight: Math.max(0, ((newExercise as WeightExercise).weight || 0) - 10),
                          }))
                        }
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNewExercise(prev => ({
                            ...(prev as WeightExercise),
                            weight: ((newExercise as WeightExercise).weight || 0) + 10,
                          }))
                        }
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Reps"
                      value={(newExercise as WeightExercise).reps || ""}
                      onChange={e =>
                        setNewExercise(prev => ({
                          ...(prev as WeightExercise),
                          reps: Number(e.target.value),
                        }))
                      }
                      className="border rounded-md px-3 py-2 flex-1"
                    />
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() =>
                          setNewExercise(prev => ({
                            ...(prev as WeightExercise),
                            reps: Math.max(0, ((newExercise as WeightExercise).reps || 0) - 10),
                          }))
                        }
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNewExercise(prev => ({
                            ...(prev as WeightExercise),
                            reps: ((newExercise as WeightExercise).reps || 0) + 10,
                          }))
                        }
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => addExercise(activeGroup)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Exercise
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recorded Exercises
            </h3>
            {muscleGroups.map(group => (
              <div
                key={group.id}
                className={group.id === activeGroup ? "block" : "hidden"}
              >
                {group.exercises.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No exercises recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {group.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <span className="font-medium">{exercise.name}</span>
                          {exercise.type === "cardio" ? (
                            <>
                              <span>{exercise.duration} min</span>
                              <span>{exercise.distance} km</span>
                              <span>{exercise.calories} kcal</span>
                            </>
                          ) : (
                            <>
                              <span>{exercise.weight} kg</span>
                              <span>{exercise.reps} reps</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => removeExercise(group.id, index)}
                          className="ml-4 text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveWorkout}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Save Workout
            </button>
          </div>
        </div>
      </div>
      {showTimer && <Timer onClose={() => setShowTimer(false)} />}
      {showRestTimer && (
        <RestTimer
          onClose={() => setShowRestTimer(false)}
          duration={restDuration}
        />
      )}
    </div>
  );
}
