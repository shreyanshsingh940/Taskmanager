import React, { useState, useEffect } from 'react';

const TaskManager = () => {
  // User profile object
  const user = {
    profile: {
      name: "Shreyansh Singh Chandel"  // Company name
    }
  };

  // Without optional chaining
// const userName = user.profile ? user.profile.name : "Guest";

// // With optional chaining
// const userName = user?.profile?.name || "Guest";

// console.log(userName);

  // State variables for tasks, form inputs, filtering, and editing
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Low');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);


  // Load tasks from localStorage on initial render
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage whenever tasks state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Function to add or update a task
  const addOrUpdateTask = () => {
    // Ensure title is provided
    if (!title) {
      alert('Title is required!');
      return;
    }

    if (isEditing) {
      // Update existing task if in editing mode
      const updatedTasks = tasks.map(task =>
        task.id === currentTaskId ? { ...task, title, description, dueDate, priority } : task
      );
      setTasks(updatedTasks);
      setIsEditing(false);
    } else {
      // Add a new task
      const newTask = {
        id: Date.now(),
        title,
        description,
        dueDate,
        priority,
        completed: false,
      };
      setTasks([...tasks, newTask]);
    }

    // Clear form inputs after adding/updating
    clearInputs();
  };

  // Function to clear form inputs
  const clearInputs = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Low');
    setIsEditing(false);
    setCurrentTaskId(null);
  };

  // Toggle task completion status
  const toggleCompletion = id => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  // Delete a task by ID
  const deleteTask = id => setTasks(tasks.filter(task => task.id !== id));

  // Populate form inputs with task data for editing
  const editTask = task => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setIsEditing(true);
    setCurrentTaskId(task.id);
  };

  // Filter tasks based on search query and priority filter
  const filterTasks = () => tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;
    return matchesSearch && matchesPriority;
  });

  // Categorize tasks for the dashboard (upcoming, overdue, completed)
  const categorizedTasks = filterTasks().reduce(
    (acc, task) => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

      if (task.completed) {
        acc.completed.push(task);
      } else if (task.dueDate && task.dueDate < today) {
        acc.overdue.push(task);
      } else {
        acc.upcoming.push(task);
      }

      return acc;
    },
    { upcoming: [], overdue: [], completed: [] }
  );

  return (
    <div className="app">
      <header>
        <h1>Welcome, {user.profile.name}!</h1>
        <hr />
        <h2>Task Dashboard</h2>
      </header>
      
      <div className="container">
        <div className="column add-edit-task">
          <h2>Add / Edit Task</h2>
          {/* Existing Add Task Form */}
          <div className="add-task">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={addOrUpdateTask}>{isEditing ? 'Update Task' : 'Add Task'}</button>
          </div>
          <div className="filters">
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
  
        <div className="column upcoming-tasks">
          <h2>Upcoming Tasks</h2>
          <div id="taskList">
            {categorizedTasks.upcoming.map(task => (
              <TaskItem key={task.id} task={task} toggleCompletion={toggleCompletion} editTask={editTask} deleteTask={deleteTask} />
            ))}
          </div>
        </div>
  
        <div className="column overdue-tasks">
          <h2>Overdue Tasks</h2>
          <div id="taskList">
            {categorizedTasks.overdue.map(task => (
              <TaskItem key={task.id} task={task} toggleCompletion={toggleCompletion} editTask={editTask} deleteTask={deleteTask} />
            ))}
          </div>
        </div>
  
        <div className="column completed-tasks">
          <h2>Completed Tasks</h2>
          <div id="taskList">
            {categorizedTasks.completed.map(task => (
              <TaskItem key={task.id} task={task} toggleCompletion={toggleCompletion} editTask={editTask} deleteTask={deleteTask} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
};

// TaskItem component to represent a single task
const TaskItem = ({ task, toggleCompletion, editTask, deleteTask }) => (
  <div className="task-item">
    <h4>{task.title}</h4>
    <span className={`priority ${task.priority}`}>{task.priority} Priority</span>
    <p>{task.description}</p>
    <p>Due: {task.dueDate || 'No due date'}</p>
    <div className="task-actions">
      <button onClick={() => toggleCompletion(task.id)}>
        <i className={task.completed ? 'fas fa-check-circle' : 'fas fa-circle'}></i>
      </button>
      <button onClick={() => editTask(task)}><i className="fas fa-edit"></i></button>
      <button onClick={() => deleteTask(task.id)}><i className="fas fa-trash-alt"></i></button>
    </div>
  </div>
);

export default TaskManager;
