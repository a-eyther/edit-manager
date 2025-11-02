import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * Usage:
 * ```jsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @component
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    // Navigate to home/dashboard
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
              {/* Header */}
              <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-red-900">
                      Something went wrong
                    </h1>
                    <p className="text-sm text-red-700 mt-0.5">
                      An unexpected error occurred in the application
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              <div className="px-6 py-6 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">
                    Error Details
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-sm text-gray-800 font-mono break-words">
                      {this.state.error && this.state.error.toString()}
                    </p>
                  </div>
                </div>

                {/* Stack Trace (Development Only) */}
                {import.meta.env.DEV && this.state.errorInfo && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">
                      Stack Trace
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* User Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    What can you do?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Try refreshing the page using the button below</li>
                    <li>Return to the dashboard and try again</li>
                    <li>If the problem persists, contact support</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                             text-gray-700 bg-white border border-gray-300 rounded-md
                             hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                             text-white bg-primary-600 rounded-md hover:bg-primary-700
                             transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>

            {/* Development Info */}
            {import.meta.env.DEV && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  💡 Stack trace is only visible in development mode
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render children normally when there's no error
    return this.props.children;
  }
}

export default ErrorBoundary;
