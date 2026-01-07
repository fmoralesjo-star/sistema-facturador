import React, { useState, useEffect } from 'react';
import { checkConnection } from '../utils/connectionManager';
import { API_URL } from '../config/api';

function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Verificar conexión al montar
    verifyConnection();

    // Verificar periódicamente
    const interval = setInterval(verifyConnection, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const verifyConnection = async () => {
    setIsChecking(true);
    try {
      const result = await checkConnection();
      setIsConnected(result.connected);
      setShowWarning(!result.connected);
      
      // Ocultar advertencia después de 5 segundos si se reconecta
      if (result.connected && showWarning) {
        setTimeout(() => setShowWarning(false), 5000);
      }
    } catch (error) {
      setIsConnected(false);
      setShowWarning(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (!showWarning && isConnected) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backgroundColor: isConnected ? '#10b981' : '#ef4444',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '350px',
        animation: showWarning ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-out',
      }}
    >
      {isChecking ? (
        <>
          <span>🔄</span>
          <span>Verificando conexión...</span>
        </>
      ) : isConnected ? (
        <>
          <span>✅</span>
          <span>Conexión restaurada</span>
        </>
      ) : (
        <>
          <span>⚠️</span>
          <div style={{ flex: 1 }}>
            <div>Sin conexión al servidor</div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
              Verificando: {API_URL.replace('/api', '')}
            </div>
          </div>
          <button
            onClick={verifyConnection}
            style={{
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Reintentar
          </button>
        </>
      )}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default ConnectionStatus;


