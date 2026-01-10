import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

// AuthContext sin Firebase - Migración a PostgreSQL
const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Al cargar, verificar si hay sesión simulada en localStorage
    const storedUser = localStorage.getItem('system_user');
    const storedToken = localStorage.getItem('system_token');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setUserToken(storedToken);
      } catch (e) {
        console.error('Error al restaurar sesión');
        localStorage.removeItem('system_user');
        localStorage.removeItem('system_token');
      }
    }
    setLoading(false);
  }, []);

  // Registrar usuario (Simulado/Placeholder para futura API)
  const signup = async (email, password, displayName, extraData = {}) => {
    console.log('📝 Registro solicitado (Simulado):', email);

    // Crear usuario mock
    const newUser = {
      uid: 'user_' + Date.now(),
      email,
      displayName: displayName || email,
      photoURL: null,
      emailVerified: true
    };

    // Guardar sesión
    localStorage.setItem('system_user', JSON.stringify(newUser));
    localStorage.setItem('system_token', 'mock_jwt_token_' + Date.now());

    setCurrentUser(newUser);
    setUserToken('mock_jwt_token_' + Date.now());

    // Intentar crear en backend si existe endpoint (opcional, para no romper flujo)
    try {
      // TODO: Conectar con endpoint real de registro POST /usuarios
    } catch (error) {
      console.warn('Backend registro no disponible aún', error);
    }

    return { user: newUser };
  };

  // Iniciar sesión (Simulado - Acepta cualquier login por ahora para desbloquear acceso)
  const login = async (email, password) => {
    console.log('🔑 Login solicitado (Simulado):', email);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = {
      uid: 'user_123456789',
      email,
      displayName: email.split('@')[0],
      emailVerified: true
    };

    localStorage.setItem('system_user', JSON.stringify(user));
    localStorage.setItem('system_token', 'mock_jwt_token_123');

    setCurrentUser(user);
    setUserToken('mock_jwt_token_123');

    return { user };
  };

  // Cerrar sesión
  const logout = async () => {
    localStorage.removeItem('system_user');
    localStorage.removeItem('system_token');
    setCurrentUser(null);
    setUserToken(null);
  };

  // Obtener token
  const getToken = async () => {
    return userToken;
  };

  const value = {
    currentUser,
    userToken,
    signup,
    login,
    logout,
    getToken,
    loading,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
