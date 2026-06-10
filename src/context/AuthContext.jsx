/**
 * AuthContext provides authentication state management
 * Handles login, register, logout, and user session management
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const AuthContext = createContext();

// Sample users for demo
const DEMO_USERS = [
  {
    id: 'user1',
    name: 'John Student',
    email: 'john@example.com',
    password: 'password123',
    avatar: null,
    bio: 'Computer Science Student',
    course: 'B.Tech CSE',
    semester: 4,
    joinDate: '2024-01-15',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to store registered users (persisted in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Check for saved user session on mount and load registered users
  useEffect(() => {
    const savedUser = localStorage.getItem('prodexa_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Load previously registered users from localStorage
    const savedRegisteredUsers = localStorage.getItem('prodexa_registered_users');
    if (savedRegisteredUsers) {
      setRegisteredUsers(JSON.parse(savedRegisteredUsers));
    }
    setLoading(false);
  }, []);

  // Login function - searches both DEMO_USERS and registered users
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Search in DEMO_USERS first
    const foundDemoUser = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );
    
    if (foundDemoUser) {
      const userData = {
        id: foundDemoUser.id,
        name: foundDemoUser.name,
        email: foundDemoUser.email,
        avatar: foundDemoUser.avatar,
        bio: foundDemoUser.bio,
        course: foundDemoUser.course,
        semester: foundDemoUser.semester,
        joinDate: foundDemoUser.joinDate,
      };
      setUser(userData);
      localStorage.setItem('prodexa_user', JSON.stringify(userData));
      setLoading(false);
      return true;
    }
    
    // Search in registered users (from localStorage)
    const foundRegisteredUser = registeredUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (foundRegisteredUser) {
      const userData = {
        id: foundRegisteredUser.id,
        name: foundRegisteredUser.name,
        email: foundRegisteredUser.email,
        avatar: foundRegisteredUser.avatar,
        bio: foundRegisteredUser.bio,
        course: foundRegisteredUser.course,
        semester: foundRegisteredUser.semester,
        joinDate: foundRegisteredUser.joinDate,
      };
      setUser(userData);
      localStorage.setItem('prodexa_user', JSON.stringify(userData));
      setLoading(false);
      return true;
    }
    
    setError('Invalid email or password');
    setLoading(false);
    return false;
  };

  // Register function - saves new user with password to persistent storage
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if email already exists in DEMO_USERS or registered users
    const existsInDemo = DEMO_USERS.find(u => u.email === email);
    const existsInRegistered = registeredUsers.find(u => u.email === email);
    if (existsInDemo || existsInRegistered) {
      setError('Email already registered');
      setLoading(false);
      return false;
    }
    
    // Create user data WITH password so they can log back in
    const registeredUser = {
      id: generateId(),
      name,
      email,
      password, // Store password so login can verify
      avatar: null,
      bio: '',
      course: '',
      semester: 1,
      joinDate: new Date().toISOString().split('T')[0],
    };
    
    // Add to registered users list and persist to localStorage
    const updatedRegisteredUsers = [...registeredUsers, registeredUser];
    setRegisteredUsers(updatedRegisteredUsers);
    localStorage.setItem('prodexa_registered_users', JSON.stringify(updatedRegisteredUsers));
    
    // Create user data for session (without password)
    const userData = {
      id: registeredUser.id,
      name: registeredUser.name,
      email: registeredUser.email,
      avatar: registeredUser.avatar,
      bio: registeredUser.bio,
      course: registeredUser.course,
      semester: registeredUser.semester,
      joinDate: registeredUser.joinDate,
    };
    
    setUser(userData);
    localStorage.setItem('prodexa_user', JSON.stringify(userData));
    setLoading(false);
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('prodexa_user');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('prodexa_user', JSON.stringify(updatedUser));
    setLoading(false);
    return true;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}