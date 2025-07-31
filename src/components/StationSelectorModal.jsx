import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // For creating portals
import './StationSelectorModal.css'; // New CSS file for the modal

// --- NEW CATEGORIZED STATION DATA ---
// You MUST ensure corresponding audio files are in public/audio/
// FIX: Added 'export' keyword here
export const categorizedStations = [
  {
    category: "Lo-Fi & Chill",
    tracks: [
      { name: 'Lofi Focus Beats', url: '/audio/Lo-Fi & Chill/Lofi Focus Beats.mp3' },
      { name: 'Forest Ambience Lofi', url: '/audio/Lo-Fi & Chill/Forest Ambience Lofi.mp3' },
      { name: 'Late Night Lofi', url: '/audio/Lo-Fi & Chill/Late Night Lofi.mp3' },
      { name: 'Back-to-School Lofi', url: '/audio/Lo-Fi & Chill/Back to School Lofi.mp3' },
      { name: 'Minimal Study Room Lofi', url: '/audio/Lo-Fi & Chill/Minimal Study Room Lofi.mp3' },
    ]
  },
  
  {
    category: "Background Noise",
    tracks: [
      { name: "White Noise", url: "/audio/Background Sounds/White Noise.mp3" },
      { name: "Brown Noise", url: "/audio/Background Sounds/Brown Noise.mp3" },
      { name: "Pink Noise", url: "/audio/Background Sounds/Pink Noise.mp3" },
    ]
  },

  {
    category: "Nature & Environment",
    tracks: [
      { name: "Rain for Focus", url: "/audio/Nature & Environment/Rain.mp3" },
      { name: "Ocean Waves", url: "/audio/Nature & Environment/Ocean.mp3" },
      { name: "Coffee Shop Ambience", url: "/audio/Nature & Environment/Coffe ambience.mp3" },
      { name: "Forest Sounds", url: "/audio/Nature & Environment/Forest.mp3" },
      { name: "Fireplace Crackle", url: "/audio/Nature & Environment/Fireplace.mp3" },
    ]
  },

  {
    category: "Instrumental Focus",
    tracks: [
      { name: "Piano Focus", url: "/audio/Instrumental Focus/Piano Focus.mp3" },
      { name: "Classical Study", url: "/audio/Instrumental Focus/Classical Study.mp3" },
      { name: "Ambient Piano", url: "/audio/Instrumental Focus/Ambient Piano.mp3" },
      { name: "Instrumental Calm", url: "/audio/Instrumental Focus/Instrumental Calm.mp3" },
    ]
  },
  
  {
    category: "Productivity Boosters",
    tracks: [
      // { name: "Deep Work", url: "/audio/Productivity Boosters/Deep Work.mp3" },
      { name: "Code Mode", url: "/audio/Productivity Boosters/Code Mode.mp3" },
      { name: "Reading Room", url: "/audio/Productivity Boosters/Reading Room.mp3" },
      { name: "Writing Flow", url: "/audio/Productivity Boosters/Writing Flow.mp3" },
    ]
  },
];

const StationSelectorModal = ({ isOpen, onClose, onSelectStation }) => {
  // Use useEffect to ensure the modal opens with proper focus management if needed
  // Or to prevent body scrolling (can be done with CSS too)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent body scrolling
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="station-modal-overlay" onClick={onClose}>
      <div className="station-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Select a Station</h2>
        <div className="station-categories">
          {categorizedStations.map((categoryData, catIndex) => (
            <div key={catIndex} className="station-category">
              <h3>{categoryData.category}</h3>
              <ul className="station-list">
                {categoryData.tracks.map((track, trackIndex) => (
                  <li 
                    key={trackIndex} 
                    onClick={() => onSelectStation(track.url)}
                    className="station-list-item"
                  >
                    {track.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="station-modal-close-button">Close</button>
      </div>
    </div>,
    document.getElementById('root') // Render into the root div or create a dedicated modal root
  );
};

export default StationSelectorModal;