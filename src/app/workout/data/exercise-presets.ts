export const DEFAULT_PRESETS = {
  chest: [
    "Bench Press",
    "Chest Press",
    "Chest Press (Incline)",
    "Chest Press (Decline)",
    "Peck Fly",
    "Dips"
  ],
  back: [
    "Lat Pulldown",
    "Deadlift",
    "Bent Over Row",
    "Pull-up",
    "Seated Row",
    "T-Bar Row",
    "Face Pull",
    "Good Morning"
  ],
  shoulders: [
    "Shoulder Press",
    "Side Raise",
    "Front Raise",
    "Rear Delt Raise",
    "Upright Row",
    "Arnold Press",
    "Military Press",
    "Shrugs"
  ],
  arms: [
    "Arm Curl",
    "Dumbbell Preacher Curl(R)",
    "Dumbbell Preacher Curl(L)",
  ],
  legs: [
    "Squat",
    "Leg Press",
    "Leg Extension",
    "Leg Curl",
    "Hack Squat",
    "Bulgaria Squat"
  ],
  abs: [
    "Crunch",
    "Plank",
    "Leg Raise",
    "Ab Machine"
  ],
  cardio: [
    "Running",
    "Cycling",
    "Walking"
  ]
} as const;

const STORAGE_KEY = "custom-exercises";

const loadCustomExercises = () => {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_PRESETS;
};

const saveCustomExercises = (exercises: typeof DEFAULT_PRESETS) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
  }
};

export const getExercisePresets = () => {
  return loadCustomExercises();
};

export const addCustomExercise = (muscleGroup: keyof typeof DEFAULT_PRESETS, exercise: string) => {
  const currentExercises = loadCustomExercises();
  if (!currentExercises[muscleGroup].includes(exercise)) {
    currentExercises[muscleGroup].push(exercise);
    saveCustomExercises(currentExercises);
  }
};

export const removeCustomExercise = (muscleGroup: keyof typeof DEFAULT_PRESETS, exercise: string) => {
  const currentExercises = loadCustomExercises();
  currentExercises[muscleGroup] = currentExercises[muscleGroup].filter((e: string) => e !== exercise);
  saveCustomExercises(currentExercises);
};

export const resetToDefaultPresets = () => {
  saveCustomExercises(DEFAULT_PRESETS);
};
