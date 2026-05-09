'use client';

import { useState, useEffect } from 'react';
import Timer from '../workout/components/Timer';
import RestTimer from '../workout/components/RestTimer';

export default function TestPage() {
  const [showTimer, setShowTimer] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render until client side
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Timer Test Page</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Timer Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Workout Timer</h2>
          <p className="text-gray-600 mb-4">
            Test the workout timer that works in the background.
          </p>
          <button
            onClick={() => setShowTimer(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Start Workout Timer (3 min)
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Rest Timer</h2>
          <p className="text-gray-600 mb-4">
            Test the rest timer that works in the background.
          </p>
          <button
            onClick={() => setShowRestTimer(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Start Rest Timer (3 min)
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Click on either timer to start it</li>
          <li>Switch to another tab or minimize the browser</li>
          <li>The timer will continue running in the background</li>
          <li>You'll get a notification when the timer completes</li>
          <li>The document title will show the remaining time</li>
          <li>Return to this tab to see the timer controls</li>
        </ul>
      </div>

      {showTimer && (
        <Timer
          onClose={() => setShowTimer(false)}
          duration={180} // 3 minutes
        />
      )}

      {showRestTimer && (
        <RestTimer
          onClose={() => setShowRestTimer(false)}
          duration={180} // 3 minutes
        />
      )}
    </div>
  );
}
