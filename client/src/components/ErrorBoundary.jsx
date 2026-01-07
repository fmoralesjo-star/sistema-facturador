import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            width: '100%',
          }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</h1>
            <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>
              Algo salió mal
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Recargar Página
            </button>
            {this.state.error && import.meta.env.DEV && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#667eea' }}>
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


