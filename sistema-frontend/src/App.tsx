import React, { useState, useEffect } from 'react';
import { AuthProvider } from './core/context/AuthContext';
import { AuthLayout } from './presentation/layouts/AuthLayout';
import { AdminLayout } from './presentation/layouts/AdminLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from './core/hooks/useAuth';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for browser back/forward buttons (history navigation)
    window.addEventListener('popstate', handleLocationChange);

    // Patch pushState so internal navigations trigger local path updates
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-white">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Switch layouts based on global Auth status
  return isAuthenticated ? <AdminLayout initialPath={currentPath} /> : <AuthLayout />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
