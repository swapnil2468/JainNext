import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='w-full min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 flex items-center justify-center px-4'>
          <div className='text-center max-w-md'>
            {/* Error Icon */}
            <div className='text-6xl mb-4'>⚠️</div>
            
            {/* Heading */}
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              Something went wrong
            </h1>
            
            {/* Description */}
            <p className='text-gray-600 mb-6'>
              We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left'>
                <p className='text-sm font-mono text-red-700 break-words'>
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            {/* Buttons */}
            <div className='flex gap-4 justify-center'>
              <button 
                onClick={this.handleReset}
                className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300 font-semibold'
              >
                Try Again
              </button>
              <a 
                href='/'
                className='bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-300 font-semibold'
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary
