/**
 * DataContext manages all application data (tasks, attendance, notes, study goals)
 * Fetches real data from MongoDB through backend APIs
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  tasksAPI,
  attendanceAPI,
  notesAPI,
  studyGoalsAPI,
  analyticsAPI,
} from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notes, setNotes] = useState([]);
  const [studyGoals, setStudyGoals] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [tasksRes, attendanceRes, notesRes, goalsRes, dashboardRes] = await Promise.all([
        tasksAPI.getAll().catch(() => ({ data: { tasks: [] } })),
        attendanceAPI.getAll().catch(() => ({ data: { records: [] } })),
        notesAPI.getAll().catch(() => ({ data: { notes: [] } })),
        studyGoalsAPI.getAll().catch(() => ({ data: { goals: [] } })),
        analyticsAPI.getDashboard().catch(() => ({ data: { stats: null } })),
      ]);

      setTasks(tasksRes.data.tasks || []);
      setAttendance(attendanceRes.data.records || []);
      setNotes(notesRes.data.notes || []);
      setStudyGoals(goalsRes.data.goals || []);
      setDashboardStats(dashboardRes.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ---- TASK OPERATIONS ----

  const addTask = async (task) => {
    try {
      const res = await tasksAPI.create(task);
      setTasks(prev => [res.data.task, ...prev]);
      return res.data.task;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await tasksAPI.update(taskId, updates);
      setTasks(prev => prev.map(t => (t._id === taskId ? res.data.task : t)));
      return res.data.task;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await tasksAPI.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => (t._id === taskId ? res.data.task : t)));
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      throw err;
    }
  };

  // ---- ATTENDANCE OPERATIONS ----

  const markAttendance = async (date, status, subject) => {
    try {
      const res = await attendanceAPI.mark({ date, status, subject });
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => {
          const aDate = new Date(a.date).toISOString().split('T')[0];
          return aDate === date;
        });
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = res.data.record;
          return updated;
        }
        return [...prev, res.data.record];
      });
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      throw err;
    }
  };

  const getAttendancePercentage = useCallback(() => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  // ---- NOTES OPERATIONS ----

  const addNote = async (note) => {
    try {
      const res = await notesAPI.create(note);
      setNotes(prev => [res.data.note, ...prev]);
      return res.data.note;
    } catch (err) {
      console.error('Failed to create note:', err);
      throw err;
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      const res = await notesAPI.update(noteId, updates);
      setNotes(prev => prev.map(n => (n._id === noteId ? res.data.note : n)));
      return res.data.note;
    } catch (err) {
      console.error('Failed to update note:', err);
      throw err;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
      throw err;
    }
  };

  const toggleNotePin = async (noteId) => {
    try {
      const note = notes.find(n => n._id === noteId);
      if (!note) return;
      const res = await notesAPI.update(noteId, { pinned: !note.pinned });
      setNotes(prev => prev.map(n => (n._id === noteId ? res.data.note : n)));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      throw err;
    }
  };

  // ---- STUDY GOALS OPERATIONS ----

  const addStudyGoal = async (goal) => {
    try {
      const res = await studyGoalsAPI.create(goal);
      setStudyGoals(prev => [...prev, res.data.goal]);
      return res.data.goal;
    } catch (err) {
      console.error('Failed to create study goal:', err);
      throw err;
    }
  };

  const updateStudyGoal = async (goalId, updates) => {
    try {
      const res = await studyGoalsAPI.update(goalId, updates);
      setStudyGoals(prev => prev.map(g => (g._id === goalId ? res.data.goal : g)));
      return res.data.goal;
    } catch (err) {
      console.error('Failed to update study goal:', err);
      throw err;
    }
  };

  const deleteStudyGoal = async (goalId) => {
    try {
      await studyGoalsAPI.delete(goalId);
      setStudyGoals(prev => prev.filter(g => g._id !== goalId));
    } catch (err) {
      console.error('Failed to delete study goal:', err);
      throw err;
    }
  };

  // ---- STATISTICS ----

  const getStatistics = useCallback(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const attendancePercentage = getAttendancePercentage();

    return { totalTasks, completedTasks, pendingTasks, attendancePercentage };
  }, [tasks, getAttendancePercentage]);

  const getRecentActivities = useCallback(() => {
    const activities = [];

    tasks.forEach(task => {
      activities.push({
        id: task._id + '-created',
        type: 'task_created',
        title: `Task created: ${task.title}`,
        timestamp: task.createdAt,
      });
    });

    attendance.slice(-5).forEach(a => {
      const dateStr = new Date(a.date).toISOString().split('T')[0];
      activities.push({
        id: a._id + '-attendance',
        type: 'attendance',
        title: `${a.status === 'present' ? 'Present' : 'Absent'} on ${dateStr}`,
        timestamp: a.date,
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }, [tasks, attendance]);

  // Fetch monthly analytics
  const fetchMonthlyAnalytics = useCallback(async (year) => {
    try {
      const res = await analyticsAPI.getMonthly({ year });
      setMonthlyAnalytics(res.data.analytics);
      return res.data.analytics;
    } catch (err) {
      console.error('Failed to fetch monthly analytics:', err);
      return null;
    }
  }, []);

  const value = {
    // Data
    tasks,
    attendance,
    notes,
    studyGoals,
    dashboardStats,
    monthlyAnalytics,
    loading,
    error,

    // Fetch
    refetchData: fetchAllData,
    fetchMonthlyAnalytics,

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