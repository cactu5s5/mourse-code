import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[SIG-DEC]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-fallback glass-panel p-6 m-4 text-center">
            <p className="font-mono text-ice text-sm">SUBSYSTEM OFFLINE</p>
            <p className="text-slate-500 text-xs mt-2">{this.props.label || 'Visual module recovered.'}</p>
            {this.props.onRetry && (
              <button type="button" className="btn-hud mt-4" onClick={() => this.setState({ hasError: false })}>
                Retry
              </button>
            )}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
