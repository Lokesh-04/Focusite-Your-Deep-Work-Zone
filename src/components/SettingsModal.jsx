import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // For creating a portal
import './SettingsModal.css'; // We'll create this CSS

const SettingsModal = ({ isOpen, onClose, currentWorkTime, currentBreakTime, onSave }) => {
  // Convert seconds to minutes for display and input
  const [workMinutes, setWorkMinutes] = useState(currentWorkTime / 60);
  const [breakMinutes, setBreakMinutes] = useState(currentBreakTime / 60);

  // Update internal state when props change (e.g., if App defaults change)
  useEffect(() => {
    setWorkMinutes(currentWorkTime / 60);
    setBreakMinutes(currentBreakTime / 60);
  }, [currentWorkTime, currentBreakTime]);

  const handleSave = () => {
    const newWorkTime = Math.max(1, parseInt(workMinutes, 10)) * 60; // Min 1 minute
    const newBreakTime = Math.max(1, parseInt(breakMinutes, 10)) * 60; // Min 1 minute
    onSave(newWorkTime, newBreakTime);
    onClose(); // Close modal after saving
  };

  const handleCancel = () => {
    onClose(); // Just close without saving
  };

  if (!isOpen) return null;

  // Use a portal to render the modal outside the main app div
  // This helps with z-index and ensures it's truly floating
  return ReactDOM.createPortal(
    <div className="settings-modal-overlay" onClick={handleCancel}> {/* Click overlay to close */}
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent click from closing modal */}
        <h2>Settings</h2>
        <div className="setting-item">
          <label htmlFor="work-time">Work Time (minutes):</label>
          <input
            id="work-time"
            type="number"
            min="1"
            value={workMinutes}
            onChange={(e) => setWorkMinutes(e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label htmlFor="break-time">Break Time (minutes):</label>
          <input
            id="break-time"
            type="number"
            min="1"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>,
    document.getElementById('root') // Or a specific modal root if you create one in index.html
  );
};

export default SettingsModal;