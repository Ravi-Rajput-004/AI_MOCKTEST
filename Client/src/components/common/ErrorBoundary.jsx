import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
          <div className="min-h-screen bg-(--color-bg-base) flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">💥</div>
                  <h2 className="text-2xl font-bold mb-2">
                      Something went wrong
                  </h2>
                  <p className="text-text-muted mb-6">
                      {this.state.error?.message ||
                          "An unexpected error occurred"}
                  </p>
                  <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                  >
                      Reload Page
                  </button>
              </div>
          </div>
      );
    }
    return this.props.children;
  }
}
