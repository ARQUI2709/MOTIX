// src/application/contexts/AppContext.js

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AuthProvider } from './AuthContext.js';
import { InspectionProvider } from './InspectionContext.js';

// 🎯 ESTADO INICIAL
const initialState = {
  // UI State
  currentView: 'landing',
  sidebarOpen: false,
  theme: 'light',

  // App State: NO USAR navigator aquí (inicializar como "true", o "null" según necesidades)
  isOnline: true,
  notifications: [],

  // Config
  appVersion: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

// 🔄 TIPOS DE ACCIÓN
const AppActionTypes = {
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
};

// 🔄 REDUCER
function appReducer(state, action) {
  switch (action.type) {
    case AppActionTypes.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
    case AppActionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case AppActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    case AppActionTypes.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };
    case AppActionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload],
      };
    case AppActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case AppActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

// 🎯 CONTEXTO
const AppContext = createContext(null);

// 🎯 PROVIDER PRINCIPAL (sin errores SSR)
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ---- Solución: sincroniza isOnline luego del montaje en cliente ----
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const setOnlineStatus = () => {
        dispatch({ type: AppActionTypes.SET_ONLINE_STATUS, payload: navigator.onLine });
      };
      setOnlineStatus();
      window.addEventListener('online', setOnlineStatus);
      window.addEventListener('offline', setOnlineStatus);

      return () => {
        window.removeEventListener('online', setOnlineStatus);
        window.removeEventListener('offline', setOnlineStatus);
      };
    }
  }, []);

  // 🔧 ACCIONES
  const setCurrentView = useCallback(view => {
    dispatch({ type: AppActionTypes.SET_CURRENT_VIEW, payload: view });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: AppActionTypes.TOGGLE_SIDEBAR });
  }, []);

  const setTheme = useCallback(theme => {
    dispatch({ type: AppActionTypes.SET_THEME, payload: theme });
  }, []);

  const addNotification = useCallback(notification => {
    const id = Date.now().toString();
    dispatch({ 
      type: AppActionTypes.ADD_NOTIFICATION, 
      payload: { ...notification, id, timestamp: new Date().toISOString() },
    });
  }, []);

  const removeNotification = useCallback(id => {
    dispatch({ type: AppActionTypes.REMOVE_NOTIFICATION, payload: id });
  }, []);

  // 🎯 VALOR DEL CONTEXTO
  const contextValue = {
    ...state,
    setCurrentView,
    toggleSidebar,
    setTheme,
    addNotification,
    removeNotification,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AuthProvider>
        <InspectionProvider>
          {children}
        </InspectionProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
};

// 🎣 HOOK PARA USAR EL CONTEXTO
export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};

export default AppContext;
