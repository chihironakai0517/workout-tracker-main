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
  const onCompleteRef = useRef(onComplete);
  const onUpdateRef = useRef(onUpdate);
  const completeFiredRef = useRef(false);
  // Fallback interval for when SW is not available
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const remainingAtStartRef = useRef<number>(duration);

  // Keep callback refs up to date without re-running effects
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

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

          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
          }
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
            onUpdateRef.current?.(event.data.remainingTime);
            break;

          case 'TIMER_COMPLETE':
            setTimerState(prev => ({
              ...prev,
              isComplete: true,
              remainingTime: 0
            }));
            if (!completeFiredRef.current) {
              completeFiredRef.current = true;
              onCompleteRef.current?.();
            }
            break;

          case 'TIMER_SYNC': {
            const timerData = event.data.timers.find(
              ([id]: [string, TimerState]) => id === timerId.current
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
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Fallback: JS interval when SW is not available or not yet active
  const startFallbackInterval = useCallback((initialRemaining: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = Date.now();
    remainingAtStartRef.current = initialRemaining;
    completeFiredRef.current = false;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      const remaining = remainingAtStartRef.current - elapsed;

      setTimerState(prev => ({
        ...prev,
        remainingTime: remaining,
        isComplete: remaining <= 0,
        isActive: true
      }));

      onUpdateRef.current?.(remaining);

      if (remaining <= 0 && !completeFiredRef.current) {
        completeFiredRef.current = true;
        onCompleteRef.current?.();
      }
    }, 1000);
  }, []);

  const stopFallbackInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    if (timerId.current) {
      localStorage.setItem(`timer-${timerId.current}`, JSON.stringify({
        ...timerState,
        timestamp: Date.now()
      }));
    }
  }, [timerState]);

  // Cleanup localStorage on unmount
  useEffect(() => {
    return () => {
      if (timerId.current) {
        localStorage.removeItem(`timer-${timerId.current}`);
      }
      stopFallbackInterval();
    };
  }, [stopFallbackInterval]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerState.isActive) {
        if (swRegistration.current?.active) {
          swRegistration.current.active.postMessage({ type: 'TIMER_SYNC' });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerState.isActive]);

  const startTimer = useCallback(() => {
    completeFiredRef.current = false;
    const remaining = timerState.remainingTime || duration;

    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_START',
        timerId: timerId.current,
        duration: remaining
      });
    } else {
      // SW not ready — use JS interval fallback
      startFallbackInterval(remaining);
    }

    setTimerState(prev => ({
      ...prev,
      isActive: true,
      isComplete: false
    }));
  }, [duration, timerState.remainingTime, startFallbackInterval]);

  const pauseTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_PAUSE',
        timerId: timerId.current
      });
    }
    stopFallbackInterval();
    setTimerState(prev => ({ ...prev, isActive: false }));
  }, [stopFallbackInterval]);

  const resumeTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_RESUME',
        timerId: timerId.current
      });
    } else {
      startFallbackInterval(timerState.remainingTime);
    }
    setTimerState(prev => ({ ...prev, isActive: true }));
  }, [timerState.remainingTime, startFallbackInterval]);

  const stopTimer = useCallback(() => {
    if (swRegistration.current?.active && timerId.current) {
      swRegistration.current.active.postMessage({
        type: 'TIMER_STOP',
        timerId: timerId.current
      });
    }
    stopFallbackInterval();
    setTimerState({
      isActive: false,
      remainingTime: duration,
      isComplete: false
    });
    if (timerId.current) {
      localStorage.removeItem(`timer-${timerId.current}`);
    }
  }, [duration, stopFallbackInterval]);

  const resetTimer = useCallback(() => {
    stopTimer();
    completeFiredRef.current = false;
    setTimerState(prev => ({ ...prev, remainingTime: duration }));
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
