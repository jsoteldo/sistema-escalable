import React, { useState } from 'react';
import { useAuth } from '../../core/hooks/useAuth';

export const AuthLayout: React.FC = () => {
  const { login, loginWithSocialToken, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registeredStatus, setRegisteredStatus] = useState<string | null>(null);

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      console.log("Login OK", data);
    } catch (err) {
      // Error is caught and set inside hook state
      console.error("Login failed:", err);
    }
  };

  const handleSocialMockLogin = async (provider: 'google' | 'facebook') => {
    try {
      // Send mock token to auth module endpoint
      await loginWithSocialToken(provider, `mock-${provider}-token-xyz`);
    } catch (err) {
      alert('Error en el login social de prueba');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center bg-dark text-white min-vh-100 p-3">
      <div className="card bg-secondary text-white shadow-lg p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '15px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold tracking-tight">AdminLTE Stack</h2>
          <p className="text-white-50">Acceso al Sistema de Gestión</p>
        </div>

        {registeredStatus === 'PENDIENTE' ? (
          <div className="alert alert-warning text-center" role="alert">
            <h5 className="alert-heading">Registro Exitoso!</h5>
            <p className="mb-0">Tu cuenta ha sido creada con estado <strong>PENDIENTE</strong>. Espera aprobación del administrador.</p>
            <button className="btn btn-outline-light btn-sm mt-3" onClick={() => setRegisteredStatus(null)}>
              Volver al Login
            </button>
          </div>
        ) : (
          <div>
            {error && (
              <div className="alert alert-danger text-center py-2 mb-3" style={{ fontSize: '0.9rem' }} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLocalLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control bg-dark text-white border-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control bg-dark text-white border-secondary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3 fw-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cargando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="text-center mb-3">
              <span className="text-white-50">O iniciar sesión con:</span>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-danger w-50 d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleSocialMockLogin('google')}
                disabled={isLoading}
              >
                <span>Google</span>
              </button>
              <button
                className="btn btn-primary w-50 d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleSocialMockLogin('facebook')}
                style={{ backgroundColor: '#3b5998' }}
                disabled={isLoading}
              >
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
