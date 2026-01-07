import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

// Importar Firebase
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as signOutFn,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

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

  // Registrar usuario
  const signup = async (email, password, displayName, extraData = {}) => {
    if (!auth) {
      throw new Error('Firebase no está configurado. Ejecuta INSTALAR-FIREBASE.bat y configura las variables de entorno.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Obtener token y sincronizar con backend
    const token = await userCredential.user.getIdToken();
    setUserToken(token);

    // Sincronizar usuario con el backend (silencioso si falla)
    try {
      await axios.post(
        `${API_URL}/usuarios/sync-firebase`,
        {
          firebase_uid: userCredential.user.uid,
          email: userCredential.user.email,
          nombre_completo: displayName || userCredential.user.email,
          // Datos extra tipo RRHH
          identificacion: extraData.identificacion,
          telefono: extraData.telefono,
          direccion: extraData.direccion,
          fecha_nacimiento: extraData.fecha_nacimiento,
          sueldo: extraData.sueldo,
          foto_cedula_anverso: extraData.foto_cedula_anverso,
          foto_cedula_reverso: extraData.foto_cedula_reverso
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
          validateStatus: () => true,
        }
      ).catch(() => {
        return null;
      });
    } catch (error) {
      // Silenciar completamente
    }

    return userCredential;
  };

  // Iniciar sesión
  const login = async (email, password) => {
    if (!auth) {
      throw new Error('Firebase no está configurado. Ejecuta INSTALAR-FIREBASE.bat y configura las variables de entorno.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    setUserToken(token);
    return userCredential;
  };

  // Cerrar sesión
  const logout = async () => {
    if (!auth) {
      return;
    }

    await signOutFn(auth);
    setUserToken(null);
  };

  // Obtener token actual
  const getToken = async () => {
    if (!auth || !currentUser) {
      return null;
    }

    try {
      const token = await currentUser.getIdToken(true);
      setUserToken(token);
      return token;
    } catch (error) {
      if (error.code !== 'auth/network-request-failed' &&
        error.code !== 'auth/internal-error') {
        console.error('Error al obtener token:', error);
      }
      return null;
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const token = await user.getIdToken();
          setUserToken(token);
        } catch (error) {
          if (error.code !== 'auth/network-request-failed' &&
            error.code !== 'auth/internal-error') {
            console.error('Error al obtener token:', error);
          }
        }
      } else {
        setUserToken(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
