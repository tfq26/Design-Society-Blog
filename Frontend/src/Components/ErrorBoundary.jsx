import { Component, useState } from 'react';
import { useNavigate, useRouteError, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiCheck } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// ErrorPage component that can be used directly or via ErrorBoundary
const ErrorPage = ({ error: propError, resetError }) => {
  const [copied, setCopied] = useState(false);
  let routeError;
  try {
    routeError = useRouteError();
  } catch (e) {
    // Ignore if useRouteError is not available
    console.debug('useRouteError not available in current context');
  }
  const error = propError || routeError || new Error('An unknown error occurred');
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  console.error('ErrorPage error:', error);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
    },
    tap: { scale: 0.98 }
  };

  const handleGoHome = () => {
    if (resetError) resetError();
    navigate('/');
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-orange-wheel to-orange-200 flex flex-col items-center justify-center p-6 rounded-3xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl w-full bg-beige rounded-2xl shadow-xl p-8 text-center">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <img 
            src="/logo.png" 
            alt="Design Society Blog Logo" 
            className="h-32 w-32 mx-auto filter drop-shadow-lg"
          />
        </motion.div>

        <h1 className="text-5xl font-bold text-gray-800 mb-4">Oops!</h1>
        <p className="text-xl text-gray-600 mb-8">
          {error?.statusText || error?.message || "An unexpected error occurred"}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleGoHome}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium transition-colors hover:bg-indigo-700"
          >
            Go to Home
          </motion.button>

          {resetError && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => resetError()}
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium transition-colors hover:bg-indigo-50"
            >
              Try Again
            </motion.button>
          )}
        </div>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setShowDetails(!showDetails)}
          className="px-6 py-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4"
        >
          {showDetails ? 'Hide Details' : 'Show Error Details'}
        </motion.button>

        <AnimatePresence>
          {showDetails && error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <motion.button
                    onClick={() => {
                      const errorDetails = JSON.stringify(
                        {
                          message: error.message,
                          status: error.status || error.statusCode,
                          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                          ...(process.env.NODE_ENV === 'development' ? error : {})
                        },
                        null,
                        2
                      );
                      navigator.clipboard.writeText(errorDetails);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Copy error details"
                  >
                    {copied ? (
                      <FiCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <FiCopy className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
                <div className="bg-gray-50 p-4 pr-12 rounded-lg text-left font-mono text-sm text-gray-700 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                  {JSON.stringify(
                    {
                      message: error.message,
                      status: error.status || error.statusCode,
                      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                      ...(process.env.NODE_ENV === 'development' ? error : {})
                    },
                    null,
                    2
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export { ErrorBoundary, ErrorPage };
