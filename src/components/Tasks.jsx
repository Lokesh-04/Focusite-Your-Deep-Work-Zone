import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('focusite-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    localStorage.setItem('focusite-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleInputChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Date.now(), text: newTask.trim(), completed: false },
      ]);
      setNewTask('');
    }
  };

  const handleToggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }
  };

  const activeTasksCount = tasks.filter((task) => !task.completed).length;
  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const allTasksCount = tasks.length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') {
      return !task.completed;
    } else if (filter === 'completed') {
      return task.completed;
    }
    return true;
  });

  return (
    <div className="tasks-container panel tasks-panel">
      <h3>My tasks</h3>
      <div className="filter-buttons">
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active <span>{activeTasksCount}</span> {/* Removed brackets */}
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed <span>{completedTasksCount}</span> {/* Removed brackets */}
        </button>
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Tasks <span>{allTasksCount}</span> {/* Removed brackets */}
        </button>
      </div>

      <div className="add-task-input-wrapper">
        <input
          type="text"
          placeholder="Add an item"
          value={newTask}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTask();
            }
          }}
        />
        <button onClick={handleAddTask} className="add-task-button">
          <FaPlus />
        </button>
      </div>

      <ul className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <span className="task-text">{task.text}</span>
              <div className="task-actions">
                <button onClick={() => handleDeleteTask(task.id)} className="delete-button">
                  <FaTimes />
                </button>
                <button onClick={() => handleToggleComplete(task.id)} className="complete-button">
                  <FaCheck />
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="no-tasks-message">No tasks to display for this filter.</p>
        )}
      </ul>
    </div>
  );
};

export default Tasks;