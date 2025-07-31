import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import the new icons
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { AiOutlineGithub } from "react-icons/ai";

import PomodoroTimer from './components/PomodoroTimer';
import LiveMusicPlayer from './components/LiveMusicPlayer';
import Tasks from './components/Tasks';
import SettingsModal from './components/SettingsModal';
import './App.css';

// HomeContent remains the same
const HomeContent = ({ workTime, breakTime, onSetTimerSettings }) => (
  <>
    <PomodoroTimer
      initialWorkTime={workTime}
      initialBreakTime={breakTime}
    />
    <Tasks />
  </>
);

function App() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [workTime, setWorkTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);

  const handleSetTimerSettings = (newWorkTime, newBreakTime) => {
    setWorkTime(newWorkTime);
    setBreakTime(newBreakTime);
  };

  return (
    <Router>
      <header>
        <h1 className="header-title">Focusite</h1>

        <div className="header-icons">
          <button
            className="settings-cog-button"
            onClick={() => setIsSettingsModalOpen(true)}
            aria-label="Open Settings"
          >
            {/* Use the new Cog icon */}
            <HiOutlineCog6Tooth />
          </button>
          <a href="https://github.com/Lokesh-04/Focusite-Your-Deep-Work-Zone" target="_blank" rel="noopener noreferrer" className="github-icon-link">
            {/* Use the new GitHub icon */}
            <AiOutlineGithub />
          </a>
        </div>
      </header>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomeContent
                workTime={workTime}
                breakTime={breakTime}
                onSetTimerSettings={handleSetTimerSettings}
              />
            }
          />
        </Routes>
      </main>
      <LiveMusicPlayer />

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentWorkTime={workTime}
          currentBreakTime={breakTime}
          onSave={handleSetTimerSettings}
        />
      )}
    </Router>
  );
}

export default App;
