import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { MdOutlineMusicNote, MdOutlineMusicOff } from "react-icons/md";
import { TbInfinityOff, TbInfinity } from "react-icons/tb"; // UPDATED: Import new loop icons
import './LiveMusicPlayer.css';

// Import the StationSelectorModal component and its categorizedStations data
import StationSelectorModal, { categorizedStations } from './StationSelectorModal';


// --- Derive the FLATTENED list of stations from categorizedStations ---
// The LiveMusicPlayer's core logic (currentStationIndex, next/prev) uses this flat list.
const flattenedStations = categorizedStations.flatMap(category => category.tracks);


const LiveMusicPlayer = () => {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGenreName, setCurrentGenreName] = useState(flattenedStations.length > 0 ? flattenedStations[0].name : "No Station");
  const audioRef = useRef(null);
  const [isMusicGloballyEnabled, setIsMusicGloballyEnabled] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0.5); // State for volume (0 to 1)
  const [showArrowHint, setShowArrowHint] = useState(false);
  const [isStationSelectorOpen, setIsStationSelectorOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false); // State for loop functionality

  // 1. Effect for Global Music Enable/Disable
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMusicGloballyEnabled) {
      audio.pause();
      audio.src = ""; // Clear source to stop buffering/requests
      setIsPlaying(false);
      setCurrentGenreName("No Station"); // Reset genre name when globally disabled
    } else {
      // If enabled, and no source is set, load the current track
      if (flattenedStations.length > 0 && !audio.src) {
        const initialTrack = flattenedStations[currentStationIndex];
        audio.src = initialTrack.url;
        setCurrentGenreName(initialTrack.name);
        // Attempt to play if it was meant to be playing
        if (isPlaying) {
          audio.play().catch(e => console.warn("Autoplay blocked on global enable:", e));
        }
      } else if (isPlaying && audio.paused) {
        // If globally enabled, music was playing, but paused (e.g., from tab change), try to resume
        audio.play().catch(e => console.warn("Autoplay blocked on resume global enable:", e));
      }
    }
  }, [isMusicGloballyEnabled, currentStationIndex, isPlaying, flattenedStations]);


  // 2. Effect for Changing Station (currentStationIndex)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isMusicGloballyEnabled || flattenedStations.length === 0) return;

    const newTrack = flattenedStations[currentStationIndex];
    if (audio.src !== newTrack.url) { // Only update src if it's a different track
      audio.src = newTrack.url;
      setCurrentGenreName(newTrack.name);
      if (isPlaying) { // Only play if currently in 'playing' state
        audio.play().catch(e => console.warn("Autoplay blocked on station change:", e));
      }
    }
  }, [currentStationIndex, isMusicGloballyEnabled, isPlaying, flattenedStations]);


  // 3. Effect for Play/Pause (isPlaying state)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isMusicGloballyEnabled) return;

    if (isPlaying) {
      if (audio.src && audio.paused) { // Only attempt play if a source is loaded and it's paused
        audio.play().catch(e => console.warn("Autoplay blocked on play:", e));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, isMusicGloballyEnabled]);


  // 4. Effect for Volume Level
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volumeLevel;
    }
  }, [volumeLevel]);


  // 5. Effect for Loop Property (Seamless Toggle)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = isLooping; // This directly sets the native loop property
    }
  }, [isLooping]);


  // 6. Effect for Audio Event Listeners ('ended', 'error', 'volumechange')
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // This event will only fire if native audio.loop is false and track genuinely ends.
      // If audio.loop is true, the browser handles the seamless looping internally.
      if (!isLooping) {
        setCurrentStationIndex(prevIndex => (prevIndex + 1) % flattenedStations.length);
        setIsPlaying(true); // Automatically play the next track
      }
    };
    const handleStreamError = (e) => {
      console.error("Audio file error for URL:", audio.src, e);
      setIsPlaying(false);
      setCurrentGenreName("File Error / Not Found");
    };
    const handleAudioVolumeChange = () => {
        setVolumeLevel(audio.volume);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleStreamError);
    audio.addEventListener('volumechange', handleAudioVolumeChange);

    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleStreamError);
        audio.removeEventListener('volumechange', handleAudioVolumeChange);
      }
    };
  }, [isLooping, flattenedStations.length]); // isLooping added for handleEnded dependency, flattenedStations.length for next track logic


  // --- useEffect for Keyboard Navigation (Arrow Keys) ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isMusicGloballyEnabled) return;
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'Left') {
        event.preventDefault();
        setCurrentStationIndex(prevIndex => (prevIndex === 0 ? flattenedStations.length - 1 : prevIndex - 1));
        if (isPlaying) setIsPlaying(true);
        setShowArrowHint(true);
        setIsLooping(false); // Turn off loop when manually changing station
      } else if (event.key === 'ArrowRight' || event.key === 'Right') {
        event.preventDefault();
        setCurrentStationIndex(prevIndex => (prevIndex === flattenedStations.length - 1 ? 0 : prevIndex + 1));
        if (isPlaying) setIsPlaying(true);
        setShowArrowHint(true);
        setIsLooping(false); // Turn off loop when manually changing station
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isPlaying, isMusicGloballyEnabled, flattenedStations]);


  // --- useEffect for Arrow Hint Display Logic ---
  useEffect(() => {
    let hintTimeout;
    if (showArrowHint) {
      hintTimeout = setTimeout(() => { setShowArrowHint(false); }, 5000);
    }
    return () => clearTimeout(hintTimeout);
  }, [showArrowHint]);


  // --- Control Functions ---
  const handleGlobalMusicToggle = (event) => {
    if (!isMusicGloballyEnabled) {
      setIsMusicGloballyEnabled(true);
      setIsPlaying(true);
      setShowArrowHint(true);
    } else {
      setIsMusicGloballyEnabled(false);
      setIsPlaying(false);
      setIsLooping(false); // Turn off loop if music is globally disabled
    }
    event.currentTarget.blur();
  };

  const handlePlayPauseFromControls = (event) => {
    if (!isMusicGloballyEnabled) return;
    setIsPlaying(prev => !prev);
    event.currentTarget.blur();
  };

  const nextStation = useCallback(() => {
      if (!isMusicGloballyEnabled) return;
      if (flattenedStations.length === 0) return;
      setCurrentStationIndex(prevIndex => (prevIndex + 1) % flattenedStations.length);
      setIsPlaying(true);
      setShowArrowHint(true);
      setIsLooping(false); // Turn off loop when changing station
  }, [isMusicGloballyEnabled, flattenedStations]);

  const prevStation = useCallback(() => {
      if (!isMusicGloballyEnabled) return;
      if (flattenedStations.length === 0) return;
      setCurrentStationIndex(prevIndex => (prevIndex === 0 ? flattenedStations.length - 1 : prevIndex - 1));
      setIsPlaying(true);
      setShowArrowHint(true);
      setIsLooping(false); // Turn off loop when changing station
  }, [isMusicGloballyEnabled, flattenedStations]);

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolumeLevel(newVolume);
    // Volume update handled by its own useEffect, no direct audioRef access here
  };

  // Function to toggle looping
  const handleLoopToggle = () => {
    setIsLooping(prev => !prev);
  };

  // Callback when a station is selected from the modal
  const handleSelectStation = useCallback((selectedUrl) => {
    const newIndex = flattenedStations.findIndex(s => s.url === selectedUrl);
    if (newIndex !== -1) {
      setCurrentStationIndex(newIndex);
      setIsPlaying(true); // Start playing the selected station
      setIsLooping(false); // Turn off loop when selecting a new station from modal
    }
    setIsStationSelectorOpen(false); // Close the modal
  }, [flattenedStations, setIsPlaying]);


  return (
    <> {/* Use a fragment to return multiple top-level elements */}
      {/* --- BOTTOM-LEFT CONTROLS PANEL (floating content) --- */}
      {isMusicGloballyEnabled && (
        <div 
          className="music-left-float-container"
          tabIndex="0"
          onMouseEnter={() => setShowArrowHint(true)}
          onMouseLeave={() => setShowArrowHint(false)}
          onFocus={() => setShowArrowHint(true)}
          onBlur={() => setShowArrowHint(false)}
        >
          {/* TOP ROW: Play/Pause, Navigation, Loop Button */}
          <div className="music-controls-top-row">
            <button onClick={handlePlayPauseFromControls} className="play-pause-button" aria-label={isPlaying ? "Pause Music" : "Play Music"}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={prevStation} className="nav-button" aria-label="Previous Station">
              <FaCaretLeft />
            </button>
            <button onClick={nextStation} className="nav-button" aria-label="Next Station">
              <FaCaretRight />
            </button>
            {/* UPDATED Loop Button: uses TbInfinity / TbInfinityOff */}
            <button 
              onClick={handleLoopToggle} 
              className="nav-button loop-button" // Removed 'loop-active' class
              aria-label={isLooping ? "Disable Loop" : "Enable Loop"}
            >
              {isLooping ? <TbInfinity /> : <TbInfinityOff />}
            </button>
          </div>

          {/* NEW ROW: Genre Name and Volume Slider */}
          <div className="music-info-and-volume-row">
            <div className="genre-name clickable-genre-name" onClick={() => setIsStationSelectorOpen(true)}>
              {currentGenreName}
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumeLevel}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume Control"
            />
          </div>
          
          {/* Hint Text */}
          {showArrowHint && (
            <div className="arrow-hint">← → to change stations</div>
          )}
        </div>
      )}

      {/* --- BOTTOM-RIGHT GLOBAL TOGGLE BUTTON --- */}
      <button 
        onClick={handleGlobalMusicToggle} 
        className={`music-global-toggle-button ${isMusicGloballyEnabled ? 'enabled-state' : 'disabled-state'} ${isPlaying ? 'playing' : ''}`}
        aria-label={isMusicGloballyEnabled ? (isPlaying ? "Pause Music" : "Play Music") : "Enable Music"}
      >
        {!isMusicGloballyEnabled ? (
          <MdOutlineMusicOff />
        ) : (
          <MdOutlineMusicNote />
        )}
      </button>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto"></audio>

      {/* --- NEW: Station Selector Modal --- */}
      {isStationSelectorOpen && (
        <StationSelectorModal 
          isOpen={isStationSelectorOpen} 
          onClose={() => setIsStationSelectorOpen(false)} 
          onSelectStation={handleSelectStation} 
        />
      )}
    </>
  );
};

export default LiveMusicPlayer;