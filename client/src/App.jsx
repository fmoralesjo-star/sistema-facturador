import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import io from 'socket.io-client'
import { SOCKET_URL } from './config/api'
import './utils/connectionManager'
import Home from './pages/Home'
import Facturacion from './pages/Facturacion'
import SeleccionarPuntoVenta from './pages/SeleccionarPuntoVenta'
import Contabilidad from './pages/Contabilidad'
import Tesoreria from './pages/Tesoreria'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import Compras from './pages/Compras'
import Proveedores from './pages/Proveedores'
import Admin from './pages/Admin'
import AdministracionTI from './pages/AdministracionTI'
import SRI from './pages/SRI'
import Reportes from './pages/Reportes'
import Inventario from './pages/Inventario'
import Dashboard from './pages/Dashboard'
import Bancos from './pages/Bancos'
import Transferencias from './pages/Transferencias'
import Conciliaciones from './pages/Conciliaciones'
import Promociones from './pages/Promociones'
import ReportesConsolidados from './pages/ReportesConsolidados'
import Login from './pages/Login'
import PuntosVenta from './pages/admin/PuntosVenta'
import GeneradorATS from './pages/admin/GeneradorATS'
import NotasCredito from './pages/NotasCredito'
import RecursosHumanos from './pages/RecursosHumanos'
import Cartera from './pages/Cartera'
import EcommerceDashboard from './pages/EcommerceDashboard'
import StoreLayout from './pages/store/StoreLayout'
import StoreHome from './pages/store/StoreHome'
import StoreCheckout from './pages/store/StoreCheckout'
import { useAuth } from './contexts/AuthContext'
import ConnectionStatus from './components/ConnectionStatus'
import './App.css'

// Registrar Service Worker para PWA con actualización automática
let swRegistration = null;

function checkForUpdates(registration) {
  if (!registration) return;
  try {
    registration.update().then(() => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(() => {
          window.location.reload(true);
        }, 500);
      }
    }).catch((error) => {
      console.log('Error al verificar actualizaciones:', error);
    });
  } catch (error) {
    console.log('Error en checkForUpdates:', error);
  }
}

// Registrar Service Worker solo en producción (no en desarrollo)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          swRegistration = reg;
          console.log('✅ Service Worker registrado');

          // Forzar actualización inmediata
          reg.update();
          setTimeout(() => checkForUpdates(reg), 1000);

          // Escuchar actualizaciones
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  setTimeout(() => window.location.reload(true), 100);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Error al registrar Service Worker:', error);
        });

      // Verificar actualizaciones cada minuto
      setInterval(() => {
        if (swRegistration) {
          swRegistration.update();
          checkForUpdates(swRegistration);
        }
      }, 60 * 1000);

      // Verificar al hacer visible (al abrir desde escritorio)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && swRegistration) {
          swRegistration.update();
          checkForUpdates(swRegistration);
        }
      });

      // Verificar al enfocar (al hacer clic en el icono)
      window.addEventListener('focus', () => {
        if (swRegistration) {
          swRegistration.update();
          checkForUpdates(swRegistration);
        }
      });
    } catch (error) {
      console.log('Error al configurar Service Worker:', error);
    }
  });
}

// Detectar si está en modo standalone (PWA instalada)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone ||
  document.referrer.includes('android-app://');

if (isStandalone) {
  document.documentElement.classList.add('standalone');
}

// Configurar Socket.io con mejor compatibilidad
const socketConfig = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
  forceNew: false,
  // Mejorar compatibilidad con diferentes redes
  upgrade: true,
  rememberUpgrade: false,
};

// Manejar errores de conexión de forma más robusta
let socket = null;
try {
  // Verificar que SOCKET_URL sea válida antes de inicializar
  if (SOCKET_URL && typeof SOCKET_URL === 'string' && SOCKET_URL.trim() !== '') {
    socket = io(SOCKET_URL, socketConfig);

    socket.on('connect_error', (error) => {
      // Silenciar errores de conexión - no mostrar en consola
      // El componente ConnectionStatus manejará la visualización
      if (import.meta.env.DEV) {
        console.log('Error de conexión Socket.io (esperado si el servidor no está disponible):', error.message);
      }
    });

    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('✅ Socket.io conectado');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      // Solo mostrar en desarrollo
      if (import.meta.env.DEV) {
        console.log(`✅ Reconectado después de ${attemptNumber} intentos`);
      }
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar manualmente
        socket.connect();
      }
      // Silenciar warnings de desconexión
    });
  } else {
    console.warn('⚠️ SOCKET_URL no está configurada correctamente:', SOCKET_URL);
  }
} catch (error) {
  console.error('Error al inicializar Socket.io:', error);
  // Continuar sin Socket.io si falla la inicialización
  socket = null;
}

// Componente para proteger rutas (opcional si Firebase está configurado)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Verificar si Firebase está configurado
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  };

  const firebaseEnabled = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

  console.log('🔐 ProtectedRoute:', {
    firebaseEnabled,
    loading,
    isAuthenticated,
    path: window.location.pathname
  });

  // Si Firebase no está configurado, permitir acceso sin autenticación
  if (!firebaseEnabled) {
    console.log('✅ Firebase no configurado, permitiendo acceso')
    return children;
  }

  if (loading) {
    console.log('⏳ ProtectedRoute: Cargando...')
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated && firebaseEnabled) {
    console.log('🚫 ProtectedRoute: No autenticado, redirigiendo a login')
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Permitiendo acceso')
  return children;
}

function App() {
  const [notificacion, setNotificacion] = useState(null)

  // ELIMINAR Service Workers automáticamente en desarrollo
  useEffect(() => {
    // Solo en desarrollo (no en producción)
    if (import.meta.env.DEV && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then((success) => {
            if (success) {
              console.log('✅ Service Worker eliminado automáticamente (modo desarrollo):', registration.scope)
              // Limpiar cache también
              if ('caches' in window) {
                caches.keys().then((cacheNames) => {
                  cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName)
                    console.log('✅ Cache eliminado:', cacheName)
                  })
                })
              }
            }
          })
        })
      }).catch((error) => {
        console.log('Error al eliminar Service Worker:', error)
      })
    }
  }, [])

  // Verificar y aplicar actualizaciones al montar (al abrir desde escritorio)
  useEffect(() => {
    // Detectar si viene con parámetro de actualización forzada
    const urlParams = new URLSearchParams(window.location.search);
    const forceUpdate = urlParams.get('t');

    if (forceUpdate) {
      // Limpiar parámetro de URL
      window.history.replaceState({}, '', window.location.pathname);
      // Forzar recarga completa
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    }

    // Verificar actualizaciones al montar
    if ('serviceWorker' in navigator && swRegistration) {
      setTimeout(() => {
        try {
          swRegistration.update();
          checkForUpdates(swRegistration);
        } catch (error) {
          console.log('Error al verificar actualizaciones:', error);
        }
      }, 2000);
    }

    // Si está en modo PWA, forzar verificación más agresiva
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) {
              reg.update();
            }
          });
        }
      }, 3000);
    }
  }, [])

  useEffect(() => {
    if (!socket) return;

    socket.on('factura-creada', (data) => {
      setNotificacion({ tipo: 'success', mensaje: `Nueva factura creada: ${data.numero}` })
      setTimeout(() => setNotificacion(null), 3000)
    })

    socket.on('contabilidad-actualizada', () => {
      setNotificacion({ tipo: 'info', mensaje: 'Contabilidad actualizada' })
      setTimeout(() => setNotificacion(null), 3000)
    })

    return () => {
      if (socket) {
        socket.off('factura-creada')
        socket.off('contabilidad-actualizada')
      }
    }
  }, [])

  return (
    <Router>
      <div className="app">
        <ConnectionStatus />
        <NavBar />
        {notificacion && (
          <div className={`notificacion ${notificacion.tipo}`}>
            {notificacion.mensaje}
          </div>
        )}
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion"
              element={
                <ProtectedRoute>
                  <SeleccionarPuntoVenta />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion/nueva"
              element={
                <ProtectedRoute>
                  <Facturacion socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contabilidad"
              element={
                <ProtectedRoute>
                  <Contabilidad socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria"
              element={
                <ProtectedRoute>
                  <Tesoreria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clientes socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <Productos socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compras"
              element={
                <ProtectedRoute>
                  <Compras socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/administracion-ti"
              element={
                <ProtectedRoute>
                  <AdministracionTI socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sri"
              element={
                <ProtectedRoute>
                  <SRI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Reportes socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <Inventario socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bancos"
              element={
                <ProtectedRoute>
                  <Bancos socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transferencias"
              element={
                <ProtectedRoute>
                  <Transferencias socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conciliaciones"
              element={
                <ProtectedRoute>
                  <Conciliaciones socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/promociones"
              element={
                <ProtectedRoute>
                  <Promociones socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes-consolidados"
              element={
                <ProtectedRoute>
                  <ReportesConsolidados socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/puntos-venta"
              element={
                <ProtectedRoute>
                  <PuntosVenta />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notas-credito"
              element={
                <ProtectedRoute>
                  <NotasCredito socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recursos-humanos"
              element={
                <ProtectedRoute>
                  <RecursosHumanos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cartera"
              element={
                <ProtectedRoute>
                  <Cartera />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute>
                  <Proveedores socket={socket} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mobile-app"
              element={
                <ProtectedRoute>
                  <EcommerceDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rutas Públicas de la Tienda (E-commerce) */}
            <Route path="/store" element={<StoreLayout />}>
              <Route index element={<StoreHome />} />
              <Route path="checkout" element={<StoreCheckout />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  )
}

function NavBar() {
  const location = useLocation()
  const [actualizando, setActualizando] = useState(false)
  const { currentUser, logout, isAuthenticated } = useAuth();

  // Verificar si Firebase está configurado
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  };
  const firebaseEnabled = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

  // Ocultar navbar en la página principal, facturación y login
  // Ocultar navbar en la página principal, login y módulos que ya tienen su propio encabezado/navegación
  const rutasSinNavbar = [
    '/',
    '/login',
    '/facturacion',
    '/facturacion/nueva',
    '/contabilidad',
    '/clientes',
    '/productos',
    '/inventario',
    '/compras',
    '/bancos',
    '/transferencias',
    '/conciliaciones',
    '/promociones',
    '/dashboard',
    '/admin',
    '/administracion-ti',
    '/sri',
    '/reportes',
    '/reportes-consolidados',
    '/recursos-humanos',
    '/proveedores',
    '/notas-credito',
    '/cartera',
    '/tesoreria',
    '/mobile-app',
    '/store' // Ocultar Navbar Admin en la tienda (tiene su propia Navbar)
  ]

  if (rutasSinNavbar.some(ruta => location.pathname === ruta || location.pathname.startsWith(ruta + '/'))) {
    return null
  }

  const handleActualizar = async () => {
    setActualizando(true)

    try {
      // Limpiar cache y actualizar Service Worker
      if ('serviceWorker' in navigator) {
        // Desregistrar todos los Service Workers
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (let registration of registrations) {
          await registration.unregister()
        }

        // Limpiar todos los caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          for (let cacheName of cacheNames) {
            await caches.delete(cacheName)
          }
        }
      }

      // Recargar con timestamp para evitar cache
      window.location.href = window.location.pathname + '?t=' + Date.now()
    } catch (error) {
      console.error('Error al actualizar:', error)
      // Si falla, al menos recargar la página
      window.location.reload(true)
    } finally {
      setActualizando(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>📊 Sistema Facturador</h1>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Inicio
          </Link>
          <Link to="/facturacion" className={location.pathname === '/facturacion' ? 'active' : ''}>
            Facturación
          </Link>
          <Link to="/notas-credito" className={location.pathname === '/notas-credito' ? 'active' : ''}>
            Notas de Crédito
          </Link>
          <Link to="/contabilidad" className={location.pathname === '/contabilidad' ? 'active' : ''}>
            Contabilidad
          </Link>
          <Link to="/clientes" className={location.pathname === '/clientes' ? 'active' : ''}>
            Clientes
          </Link>
          <Link to="/productos" className={location.pathname === '/productos' ? 'active' : ''}>
            Productos
          </Link>
          <Link to="/inventario" className={location.pathname === '/inventario' ? 'active' : ''}>
            Inventario
          </Link>
          <Link to="/compras" className={location.pathname === '/compras' ? 'active' : ''}>
            Compras
          </Link>
          <Link to="/bancos" className={location.pathname === '/bancos' ? 'active' : ''}>
            Bancos
          </Link>
          <Link to="/transferencias" className={location.pathname === '/transferencias' ? 'active' : ''}>
            Transferencias
          </Link>
          <Link to="/conciliaciones" className={location.pathname === '/conciliaciones' ? 'active' : ''}>
            Conciliaciones
          </Link>
          <Link to="/promociones" className={location.pathname === '/promociones' ? 'active' : ''}>
            Promociones
          </Link>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            Admin
          </Link>
          <Link to="/administracion-ti" className={location.pathname === '/administracion-ti' ? 'active' : ''}>
            Administración TI
          </Link>
          <Link to="/sri" className={location.pathname === '/sri' ? 'active' : ''}>
            SRI
          </Link>
          <Link to="/reportes" className={location.pathname === '/reportes' ? 'active' : ''}>
            Reportes
          </Link>
          <Link to="/reportes-consolidados" className={location.pathname === '/reportes-consolidados' ? 'active' : ''}>
            Reportes Consolidados
          </Link>
          <Link to="/recursos-humanos" className={location.pathname === '/recursos-humanos' ? 'active' : ''}>
            RR.HH.
          </Link>
          <Link to="/mobile-app" className={location.pathname === '/mobile-app' ? 'active' : ''}>
            Tienda Online
          </Link>
          <Link to="/mobile-app" className={location.pathname === '/mobile-app' ? 'active' : ''}>
            Tienda Online
          </Link>
        </div>
        {firebaseEnabled && isAuthenticated && currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
              {currentUser.email}
            </span>
            <button
              onClick={logout}
              className="btn-logout"
              title="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
        <button
          onClick={handleActualizar}
          className="btn-refresh"
          title="Actualizar cambios"
          disabled={actualizando}
        >
          {actualizando ? '⏳' : '🔄'}
        </button>
      </div>
    </nav>
  )
}

export default App
