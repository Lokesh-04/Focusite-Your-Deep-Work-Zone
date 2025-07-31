import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = ({ initialWorkTime, initialBreakTime }) => {
  // --- UI States (Public View of the Timer's State) ---
  // timeLeft is initialized ONCE from prop. It will only change via tick or resetTimer.
  const [timeLeft, setTimeLeft] = useState(initialWorkTime);
  const [isWorking, setIsWorking] = useState(true); // true for work, false for break
  const [isActive, setIsActive] = useState(false); // Controls if timer is counting down

  // --- Pomodoro Counter State ---
  const [pomodorosToday, setPomodorosToday] = useState(() => {
    const savedCount = localStorage.getItem('pomodorosTodayCount');
    const savedDate = localStorage.getItem('pomodorosTodayDate');
    const today = new Date().toDateString(); // Get today's date string

    if (savedDate === today && savedCount !== null) {
      return parseInt(savedCount, 10);
    } else {
      localStorage.setItem('pomodorosTodayDate', today);
      return 0;
    }
  });

  // --- Refs for managing setInterval, Audio, and critical flags ---
  const intervalIdRef = useRef(null); // Stores setInterval ID for clearing
  const audioRef = useRef(null);      // Reference to the audio element
  const incrementGuardRef = useRef(false); // Ref to prevent double increment of pomodoro count


  // --- Helper function for formatting time ---
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // --- The Core Timer Logic "Tick" Function (called every second by setInterval) ---
  // This function is `useCallback` memoized. It operates purely on `prevTime` and updates UI states.
  const tick = useCallback(() => {
    setTimeLeft(prevTime => {
      if (prevTime <= 1) { // If time is 1 (last second) or already 0
        // Play sound alert when session effectively ends
        if (audioRef.current) {
          audioRef.current.play();
        }

        // --- Session Transition / Cycle Completion Logic ---
        if (isWorking) { // Work session is ending
          // Clear interval immediately for work session end (before transition)
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          setIsWorking(false); // Switch to Break session
          return initialBreakTime; // Set `timeLeft` for the break. Timer continues.
        } else { // Break session is ending (END OF ONE COMPLETE POMODORO CYCLE)
          // Clear interval immediately as this is the final stop for the cycle.
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }

          // Guard against double increment
          if (!incrementGuardRef.current) {
            setPomodorosToday(currentCount => currentCount + 1);
            incrementGuardRef.current = true; // Set flag to true after incrementing
          }
          
          setIsWorking(true); // Switch back to Work session type for next Pomodoro
          setIsActive(false); // Stop the timer after a full cycle.

          return initialWorkTime; // Reset `timeLeft` to default work time.
        }
      }
      return prevTime - 1; // Decrement normally for each tick
    });
  }, [isWorking, initialWorkTime, initialBreakTime, setPomodorosToday, setIsWorking, setIsActive]); // Dependencies for `tick`


  // --- Main useEffect for Interval Lifecycle Management ---
  // This useEffect's primary responsibility is to start or clear the `setInterval`.
  // It only runs when `isActive` changes.
  useEffect(() => {
    if (isActive && timeLeft > 0) { // Only set up if active AND has time remaining
      // Clear any existing interval before starting a new one (important for re-starting after pause)
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      // Set up the interval, calling the `tick` function every second.
      intervalIdRef.current = setInterval(tick, 1000);
    } else if (!isActive && intervalIdRef.current) { // If `isActive` becomes false, clear interval
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    // Cleanup function: Ensures interval is cleared when component unmounts or dependencies change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isActive, timeLeft, tick]); // Dependencies: `isActive` (to start/stop), `timeLeft` (to restart on transition), `tick` (stable)


  // --- No more problematic `useEffect`s that would reset `timeLeft` on pause. ---
  // `timeLeft` is now only controlled by `useState` init, `tick`, and `resetTimer`.


  // --- useEffect to update `localStorage` whenever `pomodorosToday` changes ---
  useEffect(() => {
    localStorage.setItem('pomodorosTodayCount', pomodorosToday.toString());
  }, [pomodorosToday]);


  // --- Dynamic Browser Title Update ---
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${isWorking ? 'Work' : 'Break'} | Focusite`;
  }, [timeLeft, isWorking]);


  // --- User-facing control functions ---
  const startTimer = () => {
    // Reset increment guard for a new Pomodoro cycle
    incrementGuardRef.current = false;

    // Check for new day and reset counter if needed
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('pomodorosTodayDate');
    if (savedDate !== today) {
      setPomodorosToday(0);
      localStorage.setItem('pomodorosTodayDate', today);
    }
    setIsActive(true); // This will trigger the main useEffect to start the timer
  };

  const pauseTimer = () => {
    setIsActive(false); // This is the ONLY line. It should now only pause, not reset.
  };

  const resetTimer = () => {
    // Reset increment guard
    incrementGuardRef.current = false;

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsActive(false);
    setIsWorking(true); // Reset to work session type
    setTimeLeft(initialWorkTime); // Explicitly reset display time to initial work time
    document.title = "Focusite";
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="pomodoro-timer panel pomodoro-timer-panel">
      <h2>{isWorking ? 'Work Session' : 'Break Session'}</h2>
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
      <div className="controls">
        {!isActive ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={pauseTimer}>Pause</button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div className="pomodoros-counter">
        Pomodoros Today: <span>{pomodorosToday}</span>
      </div>
      <audio ref={audioRef} src="/audio/alert.mp3" preload="auto"></audio>
    </div>
  );
};

export default PomodoroTimer;