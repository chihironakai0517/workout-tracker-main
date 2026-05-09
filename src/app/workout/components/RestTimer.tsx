'use client';

import { useEffect, useState } from 'react';
import { useBackgroundTimer } from '@/lib/useBackgroundTimer';
import { getTimerSettings } from '../utils/storage';

interface RestTimerProps {
  onClose: () => void;
  duration?: number;
}

export default function RestTimer({ onClose, duration = 600 }: RestTimerProps) {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState({ vibrationEnabled: true, soundEnabled: true });

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
    setSettings(getTimerSettings());
  }, []);

  const {
    isActive,
    remainingTime,
    isComplete,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime
  } = useBackgroundTimer({
    duration,
    onComplete: () => {
      // Play notification sound if enabled
      if (settings.soundEnabled) {
        playNotificationSound();
      }
      // Trigger vibration if enabled
      if (settings.vibrationEnabled) {
        triggerVibration();
      }
      // Don't close automatically - let user close manually
    },
    onUpdate: (remainingTime) => {
      // Update document title when timer is active
      if (remainingTime > 0) {
        document.title = `Rest Timer - ${formatTime(remainingTime)}`;
      } else {
        document.title = 'Workout Tracker';
      }
    }
  });

  // Auto-start timer when component mounts
  useEffect(() => {
    if (isClient && !isActive) {
      startTimer();
    }
  }, [isClient, isActive, startTimer]);

  // Reset document title when component unmounts
  useEffect(() => {
    return () => {
      document.title = 'Workout Tracker';
    };
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (audioError) {
      console.log('Audio notification not supported:', audioError);
    }
  };

  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Enhanced vibration pattern for mobile devices: longer and stronger
        const vibrationPattern = [500, 200, 500, 200, 500, 200, 300];
        navigator.vibrate(vibrationPattern);
      } catch (error) {
        console.log('Vibration failed:', error);
        // Fallback: try a simpler pattern
        try {
          navigator.vibrate(1000);
        } catch (fallbackVibrationError) {
          console.log('Fallback vibration also failed:', fallbackVibrationError);
        }
      }
    } else {
      console.log('Vibration API not supported');
    }
  };

  const handlePlayPause = () => {
    if (isActive) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  const handleClose = () => {
    stopTimer();
    onClose();
  };

  // Don't render until client side
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 border-2 border-blue-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          Rest Timer
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          &times;
        </button>
      </div>

      <div className="text-4xl font-bold text-center mb-4 font-mono">
        {formatTime(remainingTime)}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePlayPause}
          className={`px-4 py-2 rounded-md ${
            isActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {isComplete && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-md">
          <p className="text-green-800 text-sm text-center">
            Rest period complete! 🎉<br />
            <span className="text-xs text-green-600">Negative time shows overtime</span>
          </p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center">
        Timer works in background
      </div>
    </div>
  );
}
