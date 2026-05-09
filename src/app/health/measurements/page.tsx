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
} from "chart.js";
import { BodyMeasurement } from "../../types";
import { getMeasurements, saveMeasurement, getLatestMeasurement, updateMeasurement, deleteMeasurement } from "../utils/storage";
import { calculateBMR, calculateTDEE, getActivityLevelLabel } from "../utils/bmr";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function BodyMeasurements() {
  const [isClient, setIsClient] = useState(false);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);
  const [newMeasurement, setNewMeasurement] = useState<Omit<BodyMeasurement, "id">>({
    date: new Date().toISOString().split("T")[0],
    weight: 0,
    bodyFat: 0,
    age: 25,
    height: 170,
    gender: "male",
    bmr: 0,
    activityLevel: "moderately_active"
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const data = getMeasurements();
    // Sort by date in descending order (newest first)
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeasurements(sortedData);

    const latestMeasurement = getLatestMeasurement();
    if (latestMeasurement && !editingMeasurement) {
      setNewMeasurement({
        date: new Date().toISOString().split("T")[0],
        weight: latestMeasurement.weight,
        bodyFat: latestMeasurement.bodyFat,
        age: latestMeasurement.age,
        height: latestMeasurement.height,
        gender: latestMeasurement.gender,
        bmr: latestMeasurement.bmr,
        activityLevel: latestMeasurement.activityLevel || "moderately_active"
      });
    }
  }, [editingMeasurement, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const bmr = calculateBMR(
      newMeasurement.weight,
      newMeasurement.height,
      newMeasurement.age,
      newMeasurement.gender
    );
    setNewMeasurement(prev => ({ ...prev, bmr }));
  }, [newMeasurement.weight, newMeasurement.height, newMeasurement.age, newMeasurement.gender, isClient]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingMeasurement) {
      const updatedMeasurement = {
        ...newMeasurement,
        id: editingMeasurement.id
      };
      updateMeasurement(updatedMeasurement);
      setEditingMeasurement(null);
    } else {
      saveMeasurement(newMeasurement);
    }
    const updatedData = getMeasurements();
    // Sort by date in descending order (newest first)
    const sortedData = updatedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeasurements(sortedData);
    setNewMeasurement(prev => ({
      ...prev,
      date: new Date().toISOString().split("T")[0]
    }));
  };

  const handleEdit = (measurement: BodyMeasurement) => {
    setEditingMeasurement(measurement);
    setNewMeasurement({
      date: measurement.date,
      weight: measurement.weight,
      bodyFat: measurement.bodyFat,
      age: measurement.age,
      height: measurement.height,
      gender: measurement.gender,
      bmr: measurement.bmr,
      activityLevel: measurement.activityLevel || "moderately_active"
    });
  };

  const handleCancelEdit = () => {
    setEditingMeasurement(null);
    const latestMeasurement = getLatestMeasurement();
    if (latestMeasurement) {
      setNewMeasurement({
        date: new Date().toISOString().split("T")[0],
        weight: latestMeasurement.weight,
        bodyFat: latestMeasurement.bodyFat,
        age: latestMeasurement.age,
        height: latestMeasurement.height,
        gender: latestMeasurement.gender,
        bmr: latestMeasurement.bmr,
        activityLevel: latestMeasurement.activityLevel || "moderately_active"
      });
    }
  };

  const handleDelete = (measurement: BodyMeasurement) => {
    if (confirm("この測定データを削除してもよろしいですか？")) {
      deleteMeasurement(measurement.id);
      const updatedData = getMeasurements();
      // Sort by date in descending order (newest first)
      const sortedData = updatedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMeasurements(sortedData);

      if (editingMeasurement?.id === measurement.id) {
        handleCancelEdit();
      }
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Body Measurements</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingMeasurement ? "Edit Measurement" : "Add New Measurement"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newMeasurement.date}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={newMeasurement.height || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={newMeasurement.age || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, age: Number(e.target.value) }))}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={newMeasurement.gender}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, gender: e.target.value as "male" | "female" }))}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.bodyFat || ""}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, bodyFat: Number(e.target.value) }))}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated BMR (kcal/day)
                </label>
                <input
                  type="number"
                  value={newMeasurement.bmr || ""}
                  className="w-full border rounded-md px-3 py-2 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <select
                  value={newMeasurement.activityLevel || "moderately_active"}
                  onChange={(e) => setNewMeasurement(prev => ({
                    ...prev,
                    activityLevel: e.target.value as "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
                  }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extremely_active">Extremely Active (physical job)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated TDEE (kcal/day)
                </label>
                <input
                  type="number"
                  value={newMeasurement.bmr && newMeasurement.activityLevel ?
                    calculateTDEE(newMeasurement.bmr, newMeasurement.activityLevel) : ""}
                  className="w-full border rounded-md px-3 py-2 bg-gray-50"
                  disabled
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {editingMeasurement ? "Update Measurement" : "Add Measurement"}
                </button>
                {editingMeasurement && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">History</h2>
            {measurements.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No measurements recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {measurements.map(measurement => (
                  <div
                    key={measurement.id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {new Date(measurement.date).toLocaleDateString()}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(measurement)}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(measurement)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Weight</p>
                        <p>{measurement.weight} kg</p>
                      </div>
                      <div>
                        <p className="font-medium">Height</p>
                        <p>{measurement.height} cm</p>
                      </div>
                      <div>
                        <p className="font-medium">Age</p>
                        <p>{measurement.age} years</p>
                      </div>
                      {measurement.bodyFat && (
                        <div>
                          <p className="font-medium">Body Fat</p>
                          <p>{measurement.bodyFat}%</p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">BMR</p>
                        <p>{measurement.bmr} kcal/day</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
