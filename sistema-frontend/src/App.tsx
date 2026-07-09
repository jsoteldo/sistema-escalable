import React from 'react';
import { AuthProvider } from './core/context/AuthContext';
import { AuthLayout } from './presentation/layouts/AuthLayout';
import { AdminLayout } from './presentation/layouts/AdminLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from './core/hooks/useAuth';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
  return isAuthenticated ? <AdminLayout /> : <AuthLayout />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
