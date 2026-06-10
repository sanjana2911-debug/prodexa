/**
 * DataContext manages all application data (tasks, attendance, notes, study goals)
 * Provides CRUD operations and data persistence via localStorage
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { generateId, getTodayDate, getDaysInMonth } from '../utils/helpers';

const DataContext = createContext();

// Sample initial data for demonstration
const getInitialData = () => ({
  tasks: [
    {
      id: generateId(),
      title: 'Complete Math Assignment',
      description: 'Solve chapter 5 problems 1-20',
      priority: 'high',
      status: 'pending',
      dueDate: '2026-06-10',
      category: 'Assignment',
      createdAt: '2026-06-05T10:00:00',
    },
    {
      id: generateId(),
      title: 'Prepare for Physics Quiz',
      description: 'Review chapters 3 and 4',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2026-06-12',
      category: 'Study',
      createdAt: '2026-06-06T09:00:00',
    },
    {
      id: generateId(),
      title: 'Create Project Presentation',
      description: 'Prepare slides for final year project',
      priority: 'high',
      status: 'pending',
      dueDate: '2026-06-15',
      category: 'Project',
      createdAt: '2026-06-07T14:00:00',
    },
  ],
  attendance: generateSampleAttendance(),
  notes: [
    {
      id: generateId(),
      title: 'React Hooks Notes',
      content: 'useState: For managing local state\nuseEffect: For side effects\nuseContext: For consuming context\nuseReducer: For complex state logic',
      category: 'Programming',
      color: '#6366f1',
      pinned: true,
      createdAt: '2026-06-01T10:00:00',
      updatedAt: '2026-06-01T10:00:00',
    },
    {
      id: generateId(),
      title: 'Physics Formulas',
      content: 'F = ma\nE = mc²\nv = u + at\ns = ut + ½at²',
      category: 'Science',
      color: '#ec4899',
      pinned: false,
      createdAt: '2026-06-02T11:00:00',
      updatedAt: '2026-06-02T11:00:00',
    },
    {
      id: generateId(),
      title: 'Study Tips',
      content: '1. Pomodoro Technique: 25 min study, 5 min break\n2. Active recall over passive reading\n3. Teach concepts to others\n4. Get enough sleep',
      category: 'General',
      color: '#14b8a6',
      pinned: false,
      createdAt: '2026-06-03T09:00:00',
      updatedAt: '2026-06-03T09:00:00',
    },
  ],
  studyGoals: [
    {
      id: generateId(),
      title: 'Complete DSA Course',
      description: 'Finish remaining 5 chapters',
      type: 'weekly',
      progress: 60,
      target: 100,
      createdAt: '2026-06-01',
    },
    {
      id: generateId(),
      title: 'Read 2 Research Papers',
      description: 'AI/ML related papers',
      type: 'weekly',
      progress: 1,
      target: 2,
      createdAt: '2026-06-01',
    },
    {
      id: generateId(),
      title: 'Practice Coding Daily',
      description: 'Solve at least 2 problems on LeetCode',
      type: 'daily',
      progress: 0,
      target: 2,
      createdAt: '2026-06-08',
    },
  ],
});

// Generate last 30 days of attendance data
function generateSampleAttendance() {
  const attendance = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Skip future dates and weekends
    const dateObj = new Date(year, month, day);
    if (dateObj > today) break;
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) continue;

    attendance.push({
      id: generateId(),
      date,
      status: Math.random() > 0.15 ? 'present' : 'absent',
      subject: Math.random() > 0.5 ? 'Mathematics' : 'Computer Science',
    });
  }
  return attendance;
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('prodexa_data');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return getInitialData();
  });

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('prodexa_data', JSON.stringify(data));
  }, [data]);

  // ---- TASK OPERATIONS ----

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const updateTask = (taskId, updates) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  };

  const deleteTask = (taskId) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
  };

  const toggleTaskStatus = (taskId) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task
      ),
    }));
  };

  // ---- ATTENDANCE OPERATIONS ----

  const markAttendance = (date, status, subject) => {
    setData(prev => {
      const existingIndex = prev.attendance.findIndex(a => a.date === date);
      let newAttendance;
      
      if (existingIndex >= 0) {
        newAttendance = prev.attendance.map((a, i) =>
          i === existingIndex ? { ...a, status, subject: subject || a.subject } : a
        );
      } else {
        newAttendance = [
          ...prev.attendance,
          {
            id: generateId(),
            date,
            status,
            subject: subject || 'General',
          },
        ];
      }
      
      return { ...prev, attendance: newAttendance };
    });
  };

  const getAttendancePercentage = () => {
    const total = data.attendance.length;
    if (total === 0) return 0;
    const present = data.attendance.filter(a => a.status === 'present').length;
    return Math.round((present / total) * 100);
  };

  // ---- NOTES OPERATIONS ----

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: generateId(),
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
  };

  const updateNote = (noteId, updates) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ),
    }));
  };

  const deleteNote = (noteId) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId),
    }));
  };

  const toggleNotePin = (noteId) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId ? { ...note, pinned: !note.pinned } : note
      ),
    }));
  };

  // ---- STUDY GOALS OPERATIONS ----

  const addStudyGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({
      ...prev,
      studyGoals: [...prev.studyGoals, newGoal],
    }));
  };

  const updateStudyGoal = (goalId, updates) => {
    setData(prev => ({
      ...prev,
      studyGoals: prev.studyGoals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ),
    }));
  };

  const deleteStudyGoal = (goalId) => {
    setData(prev => ({
      ...prev,
      studyGoals: prev.studyGoals.filter(goal => goal.id !== goalId),
    }));
  };

  // ---- STATISTICS ----

  const getStatistics = () => {
    const tasks = data.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const attendancePercentage = getAttendancePercentage();
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      attendancePercentage,
    };
  };

  // Get recent activities
  const getRecentActivities = () => {
    const activities = [];
    
    // Add task activities
    data.tasks.forEach(task => {
      activities.push({
        id: task.id + '-created',
        type: 'task_created',
        title: `Task created: ${task.title}`,
        timestamp: task.createdAt,
      });
    });

    // Add attendance activities
    data.attendance.slice(-5).forEach(a => {
      activities.push({
        id: a.id + '-attendance',
        type: 'attendance',
        title: `${a.status === 'present' ? 'Present' : 'Absent'} on ${a.date}`,
        timestamp: a.date + 'T10:00:00',
      });
    });

    // Sort by timestamp descending and take last 5
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const value = {
    // Data
    tasks: data.tasks,
    attendance: data.attendance,
    notes: data.notes,
    studyGoals: data.studyGoals,
    
    // Task operations
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    
    // Attendance operations
    markAttendance,
    getAttendancePercentage,
    
    // Note operations
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
    
    // Study goal operations
    addStudyGoal,
    updateStudyGoal,
    deleteStudyGoal,
    
    // Utility
    getStatistics,
    getRecentActivities,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}