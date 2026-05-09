"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  LegendItem,
  ChartData
} from "chart.js";
import { WeeklySummary, MonthlySummary, BodyMeasurement, HealthGoals } from "../../types";
import { getWeeklySummary, getMonthlySummary, getMeasurements, getGoals } from "../utils/storage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Summary() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [goals, setGoals] = useState<HealthGoals | null>(null);

  useEffect(() => {
    if (view === "weekly") {
      console.log("Getting weekly summary for date:", selectedDate);

      // Calculate the start of the week (Monday)
      const weekStart = new Date(selectedDate);
      const dayOfWeek = weekStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Make Monday the start
      weekStart.setDate(weekStart.getDate() - daysToSubtract);
      weekStart.setHours(0, 0, 0, 0); // Set to start of day

      console.log("Calculated week start:", weekStart);

      const summary = getWeeklySummary(weekStart);
      setWeeklySummary(summary);
      console.log("Weekly Summary set:", summary);
    } else {
      const summary = getMonthlySummary(selectedDate.getFullYear(), selectedDate.getMonth());
      setMonthlySummary(summary);
    }

    // Load measurements and goals for the progress chart
    const measurementData = getMeasurements();
    setMeasurements(measurementData);
    const currentGoals = getGoals();
    setGoals(currentGoals);
  }, [view, selectedDate]);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === "weekly") {
      newDate.setDate(newDate.getDate() - 7);
      // Ensure we're moving to the start of the week
      const dayOfWeek = newDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      newDate.setDate(newDate.getDate() - daysToSubtract);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === "weekly") {
      newDate.setDate(newDate.getDate() + 7);
      // Ensure we're moving to the start of the week
      const dayOfWeek = newDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      newDate.setDate(newDate.getDate() - daysToSubtract);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const progressChartData = {
    labels: measurements.map(m =>
      new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Weight (kg)",
        data: measurements.map(m => m.weight),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        yAxisID: "weight"
      },
      ...(goals?.targetWeight ? [{
        label: "Target Weight",
        data: Array(measurements.length).fill(goals.targetWeight),
        borderColor: "rgba(75, 192, 192, 0.5)",
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        yAxisID: "weight"
      }] : []),
      {
        label: "Body Fat %",
        data: measurements.map(m => m.bodyFat),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
        yAxisID: "bodyFat"
      },
      ...(goals?.targetBodyFat ? [{
        label: "Target Body Fat",
        data: Array(measurements.length).fill(goals.targetBodyFat),
        borderColor: "rgba(255, 99, 132, 0.5)",
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        yAxisID: "bodyFat"
      }] : [])
    ]
  };

  const progressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 12
        }
      },

      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes("Weight")) {
              return `${label}: ${value} kg`;
            } else if (label.includes("Body Fat")) {
              return `${label}: ${value}%`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        reverse: false,
        title: {
          display: true,
          text: "Date"
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
          padding: 6
        }
      },
      weight: {
        type: "linear" as const,
        position: "left" as const,
        beginAtZero: false,
        title: {
          display: true,
          text: "Weight (kg)"
        },
        ticks: {
          callback: (value: number | string) => `${value} kg`,
          maxTicksLimit: 5
        }
      },
      bodyFat: {
        type: "linear" as const,
        position: "right" as const,
        beginAtZero: false,
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: "Body Fat (%)"
        },
        ticks: {
          callback: (value: number | string) => `${value}%`,
          maxTicksLimit: 5
        }
      }
    }
  };

  const nutritionChartData = {
    labels: ["Calories", "Protein", "Fat", "Carbs"],
    datasets: [
      {
        label: "Actual",
        data: [
          view === "weekly" ? (weeklySummary?.averageCalories || 0) : (monthlySummary?.averageCalories || 0),
          null, null, null
        ],
        backgroundColor: [
          view === "weekly"
            ? ((weeklySummary?.averageCalories || 0) >= (goals?.dailyCalories || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)")
            : ((monthlySummary?.averageCalories || 0) >= (goals?.dailyCalories || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)"),
          "transparent", "transparent", "transparent"
        ],
        yAxisID: "y",
        order: 1
      },
      {
        label: "Actual",
        data: [
          null,
          view === "weekly" ? (weeklySummary?.averageProtein || 0) : (monthlySummary?.averageProtein || 0),
          view === "weekly" ? (weeklySummary?.averageFat || 0) : (monthlySummary?.averageFat || 0),
          view === "weekly" ? (weeklySummary?.averageCarbs || 0) : (monthlySummary?.averageCarbs || 0)
        ],
        backgroundColor: [
          "transparent",
          view === "weekly"
            ? ((weeklySummary?.averageProtein || 0) >= (goals?.dailyProtein || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)")
            : ((monthlySummary?.averageProtein || 0) >= (goals?.dailyProtein || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)"),
          view === "weekly"
            ? ((weeklySummary?.averageFat || 0) >= (goals?.dailyFat || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)")
            : ((monthlySummary?.averageFat || 0) >= (goals?.dailyFat || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)"),
          view === "weekly"
            ? ((weeklySummary?.averageCarbs || 0) >= (goals?.dailyCarbs || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)")
            : ((monthlySummary?.averageCarbs || 0) >= (goals?.dailyCarbs || 0) ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)")
        ],
        yAxisID: "y1",
        order: 1
      },
      {
        label: "Goal",
        data: [goals?.dailyCalories || 0, null, null, null],
        backgroundColor: ["rgba(156, 163, 175, 0.5)", "transparent", "transparent", "transparent"],
        borderColor: ["rgba(156, 163, 175, 1)", "transparent", "transparent", "transparent"],
        borderWidth: 2,
        yAxisID: "y",
        order: 2
      },
      {
        label: "Goal",
        data: [null, goals?.dailyProtein || 0, goals?.dailyFat || 0, goals?.dailyCarbs || 0],
        backgroundColor: ["transparent", "rgba(156, 163, 175, 0.5)", "rgba(156, 163, 175, 0.5)", "rgba(156, 163, 175, 0.5)"],
        borderColor: ["transparent", "rgba(156, 163, 175, 1)", "rgba(156, 163, 175, 1)", "rgba(156, 163, 175, 1)"],
        borderWidth: 2,
        yAxisID: "y1",
        order: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          filter: function(legendItem: LegendItem, chartData: ChartData) {
            // Show only unique labels (remove duplicate "Actual" and "Goal")
            const labels = chartData.datasets.map((dataset) => dataset.label || '');
            return labels.indexOf(legendItem.text) === legendItem.datasetIndex ||
                   (legendItem.text === "Actual" && legendItem.datasetIndex === 0) ||
                   (legendItem.text === "Goal" && legendItem.datasetIndex === 2);
          }
        }
      },
      tooltip: {
        filter: function(tooltipItem: TooltipItem) {
          // Skip null values
          return tooltipItem.parsed.y !== null;
        },
        callbacks: {
          title: function(tooltipItems: TooltipItem[]) {
            return tooltipItems[0]?.label || '';
          },
          label: (context: TooltipItem) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const dataIndex = context.dataIndex;

            if (value === null) return undefined;

            if (label === "Actual") {
              let goal = 0;
              if (dataIndex === 0) {
                goal = goals?.dailyCalories || 0;
              } else if (dataIndex === 1) {
                goal = goals?.dailyProtein || 0;
              } else if (dataIndex === 2) {
                goal = goals?.dailyFat || 0;
              } else if (dataIndex === 3) {
                goal = goals?.dailyCarbs || 0;
              }

              const percentage = goal > 0 ? Math.round((value / goal) * 100) : 0;
              const status = percentage >= 100 ? "over goal" : "on track";

              if (dataIndex === 0) return `${value.toFixed(0)} kcal (${percentage}% ${status})`;
              else return `${value.toFixed(1)}g (${percentage}% ${status})`;
            } else {
              if (dataIndex === 0) return `Goal: ${value.toFixed(0)} kcal`;
              else return `Goal: ${value.toFixed(1)}g`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category' as const,
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Calories (kcal)"
        },
        grid: {
          drawOnChartArea: true,
        },
        ticks: {
          maxTicksLimit: 6
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Macronutrients (g)"
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          maxTicksLimit: 6
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Health Summary</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-x-2">
              <button
                onClick={() => setView("weekly")}
                className={`px-4 py-2 rounded-md ${
                  view === "weekly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setView("monthly")}
                className={`px-4 py-2 rounded-md ${
                  view === "monthly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Monthly
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                {"<"}
              </button>
              <span className="text-gray-700">
                {view === "weekly"
                  ? `Week of ${selectedDate.toLocaleDateString()}`
                  : `${selectedDate.toLocaleString("default", { month: "long" })} ${selectedDate.getFullYear()}`
                }
              </span>
              <button
                onClick={handleNext}
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                {">"}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Chart</h2>
              {measurements.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                  <div className="mb-0 pb-3 min-w-[320px] sm:min-w-[520px] h-64 sm:h-72 md:h-80">
                    <Line data={progressChartData} options={progressChartOptions} />
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Add measurements to see your progress chart
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Overview</h2>
              <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                <div className="mb-0 pb-3 min-w-[300px] sm:min-w-[500px] h-64 sm:h-72">
                  <Bar data={nutritionChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Average Weight</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? (weeklySummary?.averageWeight !== undefined ? `${weeklySummary.averageWeight.toFixed(1)} kg` : "-")
                  : (monthlySummary?.averageWeight !== undefined ? `${monthlySummary.averageWeight.toFixed(1)} kg` : "-")
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Average Body Fat</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? (weeklySummary?.averageBodyFat !== undefined ? `${weeklySummary.averageBodyFat.toFixed(1)}%` : "-")
                  : (monthlySummary?.averageBodyFat !== undefined ? `${monthlySummary.averageBodyFat.toFixed(1)}%` : "-")
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Average Calories</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? (weeklySummary?.averageCalories !== undefined ? `${weeklySummary.averageCalories.toFixed(0)} kcal` : "-")
                  : (monthlySummary?.averageCalories !== undefined ? `${monthlySummary.averageCalories.toFixed(0)} kcal` : "-")
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Water Intake</h3>
              <p className="text-2xl font-bold text-gray-900">
                {view === "weekly"
                  ? (weeklySummary?.averageWaterIntake !== undefined ? `${weeklySummary.averageWaterIntake.toFixed(0)} ml` : "-")
                  : (monthlySummary?.averageWaterIntake !== undefined ? `${monthlySummary.averageWaterIntake.toFixed(0)} ml` : "-")
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
