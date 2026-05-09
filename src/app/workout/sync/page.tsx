"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  downloadWorkoutData,
  importWorkoutData,
  generateSyncCode,
  importFromSyncCode,
  getDataStats
} from "../utils/sync";

export default function SyncPage() {
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; importedCount: number } | null>(null);
  const [syncCode, setSyncCode] = useState<string>("");
  const [generatedSyncCode, setGeneratedSyncCode] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleImportFromCode(decodeURIComponent(code));
    }

    setStats(getDataStats());
  }, []);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importWorkoutData(content);
      setImportResult(result);
      if (result.success) {
        setStats(getDataStats());
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSyncCode = () => {
    const code = generateSyncCode();
    setGeneratedSyncCode(code);
    setShowQRCode(true);
  };

  const handleImportFromCode = (code: string) => {
    const result = importFromSyncCode(code);
    setImportResult(result);
    if (result.success) {
      setStats(getDataStats());
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleSyncCodeImport = () => {
    if (syncCode.trim()) {
      handleImportFromCode(syncCode.trim());
      setSyncCode("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const generateQRCodeURL = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sync Your Workouts</h1>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back
          </Link>
        </div>

        {/* データ統計 */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Data Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-600">Total Workouts</h3>
                <p className="text-xl font-bold text-blue-900">{stats.totalWorkouts}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-green-600">Total Exercises</h3>
                <p className="text-xl font-bold text-green-900">{stats.totalExercises}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-orange-600">Total Calories</h3>
                <p className="text-xl font-bold text-orange-900">{stats.totalCalories}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-red-600">Weight Records</h3>
                <p className="text-xl font-bold text-red-900">{stats.totalMeasurements}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-yellow-600">Goals Set</h3>
                <p className="text-xl font-bold text-yellow-900">{stats.hasGoals ? "Yes" : "No"}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-purple-600">Data Size</h3>
                <p className="text-xl font-bold text-purple-900">
                  {(stats.dataSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* エクスポート */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>
            <p className="text-gray-600 mb-4">
              Download your workout data to transfer to another device or backup.
            </p>

            <button
              onClick={downloadWorkoutData}
              className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Download JSON File
            </button>

            <button
              onClick={handleGenerateSyncCode}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Generate Sync Code
            </button>

            {showQRCode && generatedSyncCode && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Sync Code Generated</h3>
                <div className="text-center mb-4">
                  <img
                    src={generateQRCodeURL(generatedSyncCode)}
                    alt="QR Code"
                    className="mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-600">Scan with your other device</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedSyncCode}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-100"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedSyncCode)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* インポート */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Data</h2>

            {/* ファイルインポート */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">From JSON File</h3>
              <p className="text-sm text-gray-600 mb-3">
                Select a JSON file exported from this app.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* コードインポート */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">From Sync Code</h3>
              <p className="text-sm text-gray-600 mb-3">
                Paste the sync code from your other device.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value)}
                  placeholder="Paste sync code here..."
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button
                  onClick={handleSyncCodeImport}
                  disabled={!syncCode.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* インポート結果 */}
        {importResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <h3 className="font-medium mb-1">
              {importResult.success ? 'Import Successful!' : 'Import Failed'}
            </h3>
            <p>{importResult.message}</p>
            {importResult.success && importResult.importedCount > 0 && (
              <p className="mt-1 text-sm">
                The page will refresh automatically to show the new data.
              </p>
            )}
          </div>
        )}

        {/* 使用方法 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Sync Between Devices</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">Method 1: JSON File</h3>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Click "Download JSON File" on your current device</li>
                <li>Transfer the file to your new device (email, cloud storage, etc.)</li>
                <li>On the new device, open this sync page and upload the file</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Method 2: Sync Code</h3>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Click "Generate Sync Code" on your current device</li>
                <li>Copy the code or scan the QR code with your new device</li>
                <li>Paste the code in the import section on your new device</li>
              </ol>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Note:</strong> The sync will merge data from both devices.
                Duplicate workouts and measurements (same ID) will be skipped automatically.
                <br />
                <strong>Synced Data:</strong> Workouts, weight measurements, and health goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
