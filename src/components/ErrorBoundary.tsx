import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          maxWidth: '600px', 
          margin: '4rem auto',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--ethio-red)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--ethio-red)', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Please try refreshing the page or navigating to a different section.
          </p>
          {this.state.error && (
            <details style={{ 
              textAlign: 'left', 
              background: 'var(--bg-secondary)', 
              padding: '1rem', 
              borderRadius: '4px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-tertiary)'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
                Error Details
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button 
            className="btn btn-primary" 
            onClick={this.handleReset}
            style={{ marginRight: '0.5rem' }}
          >
            Try Again
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
