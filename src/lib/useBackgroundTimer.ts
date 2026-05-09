import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  isActive: boolean;
  remainingTime: number;
  isComplete: boolean;
}

interface UseBackgroundTimerProps {
  duration: number;
  onComplete?: () => void;
  onUpdate?: (remainingTime: number) => void;
}

export function useBackgroundTimer({
  duration,
  onComplete,
  onUpdate
}: UseBackgroundTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    remainingTime: duration,
    isComplete: false
  });

  const timerId = useRef<string>('');
  const swRegistration = useRef<ServiceWorkerRegistration | null>(null);
  const isInitialized = useRef(false);

  // Initialize timer ID only on client side
  useEffect(() => {
    if (!isInitialized.current) {
      timerId.current = `timer-${Date.now()}-${Math.random()}`;
      isInitialized.current = true;
    }
  }, []);

  // Initialize Service Worker
  useEffect(() => {
    const initServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          swRegistration.current = registration;

          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
          }

          console.log('Service Worker registered for background timer');
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    initServiceWorker();
  }, []);

  // Listen for Service Worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.timerId === timerId.current) {
        switch (event.data.type) {
          case 'TIMER_UPDATE':
            setTimerState(prev => ({
              ...prev,
              remainingTime: event.data.remainingTime,
              isComplete: event.data.isComplete
            }));
            onUpdate?.(event.data.remainingTime);
            break;

          case 'TIMER_COMPLETE':
            setTimerState(prev => ({
              ...prev,
              isActive: false,
              isComplete: true,
              remainingTime: 0
            }));
            // Don't call onComplete immediately - let the timer continue counting negative time
            break;

          case 'TIMER_SYNC':
            // Sync timer state from Service Worker
            const timerData = event.data.timers.find(
              ([id]: [string, any]) => id === timerId.current
            );
            if (timerData) {
              const [, timer] = timerData;
              setTimerState(prev => ({
                ...prev,
                remainingTime: timer.remainingTime,
                isActive: timer.isActive,
                isComplete: timer.isComplete
              }));
            }
            break;
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [onComplete, onUpdate]);

  // Save timer state to localStorage
  useEffect(() => {
    if (timerId.current) {
      const saveState = () => {
        localStorage.setItem(`timer-${timerId.current}`, JSON.stringify({
          ...timerState,
          timestamp: Date.now()
        }));
      };

      saveState();
    }
  }, [timerState]);

  // Load timer state from localStorage on mount
  useEffect(() => {
    if (!timerId.current) return;

    const savedState = localStorage.getItem(`timer-${timerId.current}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const timeDiff = Date.now() - parsed.timestamp;

        // If timer was active and less than 1 hour has passed, restore it
        if (parsed.isActive && timeDiff < 3600000) {
          setTimerState(parsed);
        } else {
          // Clear old timer state
          localStorage.removeItem(`timer-${timerId.current}`);
        }
      } catch (error) {
        console.error('Failed to parse saved timer state:', error);
      }
    }
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerState.isActive) {
        // Page is hidden, ensure timer continues in background
        if (swRegistration.current?.active) {
          swRegistration.current.active.postMessage({
            type: 'TIMER_SYNC'
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerState.isActive]);

  const startTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_START',
        timerId: timerId.current,
        duration: timerState.remainingTime || duration
      });

      setTimerState(prev => ({
        ...prev,
        isActive: true,
        isComplete: false
      }));
    }
  }, [duration, timerState.remainingTime]);

  const pauseTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_PAUSE',
        timerId: timerId.current
      });

      setTimerState(prev => ({
        ...prev,
        isActive: false
      }));
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_RESUME',
        timerId: timerId.current
      });

      setTimerState(prev => ({
        ...prev,
        isActive: true
      }));
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_STOP',
        timerId: timerId.current
      });
    }

    setTimerState({
      isActive: false,
      remainingTime: duration,
      isComplete: false
    });

    if (timerId.current) {
      localStorage.removeItem(`timer-${timerId.current}`);
    }
  }, [duration]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimerState(prev => ({
      ...prev,
      remainingTime: duration
    }));
  }, [duration, stopTimer]);

  const formatTime = useCallback((totalSeconds: number) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = absSeconds % 60;
    const sign = isNegative ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    ...timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime,
    timerId: timerId.current
  };
}
