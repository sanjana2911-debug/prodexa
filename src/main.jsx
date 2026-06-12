import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// StrictMode is only needed in development — it double-invokes effects
// to detect bugs. In production, it adds unnecessary overhead and
// doubles API calls on mount (hitting rate limits and slowing load time).
const StrictWrapper = import.meta.env.DEV ? React.StrictMode : React.Fragment;

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictWrapper>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ConfirmProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </ConfirmProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictWrapper>
);