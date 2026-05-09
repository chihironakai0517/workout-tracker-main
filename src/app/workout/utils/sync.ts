import { WorkoutHistory } from '../types';
import { getWorkouts, saveWorkout } from './storage';
import { getMeasurements, getGoals } from '../../health/utils/storage';

// エクスポート/インポート機能
export const exportWorkoutData = (): string => {
  const workouts = getWorkouts();
  const measurements = getMeasurements();
  const goals = getGoals();

  const exportData = {
    version: '1.1',
    exportDate: new Date().toISOString(),
    workouts: workouts,
    measurements: measurements,
    goals: goals,
    totalWorkouts: workouts.length,
    totalMeasurements: measurements.length
  };
  return JSON.stringify(exportData, null, 2);
};

export const downloadWorkoutData = (): void => {
  const data = exportWorkoutData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importWorkoutData = (jsonData: string): { success: boolean; message: string; importedCount: number } => {
  try {
    const importData = JSON.parse(jsonData);

    // バージョン確認
    if (!importData.version || !importData.workouts) {
      return { success: false, message: 'Invalid data format', importedCount: 0 };
    }

    const existingWorkouts = getWorkouts();
    const existingWorkoutIds = new Set(existingWorkouts.map(w => w.id));

    let importedCount = 0;
    const newWorkouts: WorkoutHistory[] = [...existingWorkouts];

    // 重複チェックして新しいワークアウトのみ追加
    for (const workout of importData.workouts) {
      if (!existingWorkoutIds.has(workout.id)) {
        newWorkouts.push(workout);
        importedCount++;
      }
    }

    // ワークアウトデータを保存
    localStorage.setItem('workout-history', JSON.stringify(newWorkouts));

    // 体重測定データのインポート（v1.1以降）
    if (importData.measurements && Array.isArray(importData.measurements)) {
      const existingMeasurements = getMeasurements();
      const existingMeasurementIds = new Set(existingMeasurements.map(m => m.id));

      const newMeasurements = [...existingMeasurements];
      let measurementImportedCount = 0;

      for (const measurement of importData.measurements) {
        if (!existingMeasurementIds.has(measurement.id)) {
          newMeasurements.push(measurement);
          measurementImportedCount++;
        }
      }

      localStorage.setItem('body-measurements', JSON.stringify(newMeasurements));
      importedCount += measurementImportedCount;
    }

    // 目標データのインポート（v1.1以降）
    if (importData.goals && importData.goals.id) {
      localStorage.setItem('health-goals', JSON.stringify(importData.goals));
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} new items (workouts, measurements, goals)`,
      importedCount
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse JSON data',
      importedCount: 0
    };
  }
};

// QRコード用のデータ圧縮
export const generateSyncCode = (): string => {
  const workouts = getWorkouts();
  const measurements = getMeasurements();
  const goals = getGoals();

  const compressedData = {
    v: '1.1',
    d: new Date().toISOString().split('T')[0],
    w: workouts,
    m: measurements,
    g: goals
  };
  return btoa(JSON.stringify(compressedData));
};

export const importFromSyncCode = (syncCode: string): { success: boolean; message: string; importedCount: number } => {
  try {
    const decodedData = JSON.parse(atob(syncCode));
    const fullData = {
      version: decodedData.v,
      exportDate: decodedData.d,
      workouts: decodedData.w || [],
      measurements: decodedData.m || [],
      goals: decodedData.g || null
    };

    return importWorkoutData(JSON.stringify(fullData));
  } catch (error) {
    return {
      success: false,
      message: 'Invalid sync code',
      importedCount: 0
    };
  }
};

// ローカルネットワーク共有用
export const generateShareableLink = (): string => {
  const syncCode = generateSyncCode();
  const currentUrl = window.location.origin;
  return `${currentUrl}/sync?code=${encodeURIComponent(syncCode)}`;
};

// 統計情報
export const getDataStats = () => {
  const workouts = getWorkouts();
  const measurements = getMeasurements();
  const goals = getGoals();

  const totalExercises = workouts.reduce((total, workout) =>
    total + workout.muscleGroups.reduce((groupTotal, group) =>
      groupTotal + group.exercises.length, 0
    ), 0
  );

  const totalCalories = workouts.reduce((total, workout) => total + workout.totalCalories, 0);
  const dateRange = workouts.length > 0 ? {
    earliest: new Date(Math.min(...workouts.map(w => new Date(w.date).getTime()))),
    latest: new Date(Math.max(...workouts.map(w => new Date(w.date).getTime())))
  } : null;

  return {
    totalWorkouts: workouts.length,
    totalExercises,
    totalCalories,
    totalMeasurements: measurements.length,
    hasGoals: !!goals,
    dateRange,
    dataSize: JSON.stringify({ workouts, measurements, goals }).length
  };
};
