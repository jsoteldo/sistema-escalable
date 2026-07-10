import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { usePermissions } from '../../core/hooks/usePermissions';
import { ProtectedComponent } from '../components/ProtectedComponent';
import { UsuariosPage } from '../pages/UsuariosPage';

interface AdminLayoutProps {
  initialPath?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ initialPath }) => {
  const { logout, user } = useAuth();
  const { userRole } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper to derive active menu key from standard pathnames
  const getInitialMenu = (path?: string) => {
    if (path === '/usuarios') return 'usuarios';
    if (path === '/ventas') return 'ventas';
    if (path === '/clientes') return 'clientes';
    return 'dashboard';
  };

  const [activeMenu, setActiveMenu] = useState<string>(getInitialMenu(initialPath));

  // Sync menu state with browser path if updated (e.g., from browser back/forward buttons)
  useEffect(() => {
    if (initialPath) {
      setActiveMenu(getInitialMenu(initialPath));
    }
  }, [initialPath]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateTo = (menuKey: string, path: string) => {
    setActiveMenu(menuKey);
    window.history.pushState({}, '', path);
  };

  return (
    <div className={`d-flex min-vh-100 bg-light ${sidebarOpen ? '' : 'sidebar-collapsed'}`} style={{ overflowX: 'hidden' }}>
      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <aside className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '250px', minHeight: '100vh', transition: 'all 0.3s' }}>
          <div className="text-center mb-4 py-2 border-bottom border-secondary">
            <h4 className="fw-bold m-0">AdminLTE Suite</h4>
            <small className="text-muted">Rol: {userRole || 'Ninguno'}</small>
          </div>

          <nav className="nav flex-column gap-1 flex-grow-1">
            <button
              className={`nav-link btn text-start text-white border-0 py-2 px-3 rounded ${activeMenu === 'dashboard' ? 'bg-primary' : ''}`}
              onClick={() => navigateTo('dashboard', '/')}
            >
              📊 Dashboard
            </button>

            {/* Dynamic Protected Side Menu links */}
            <ProtectedComponent module="Usuarios" action="read">
              <button
                className={`nav-link btn text-start text-white border-0 py-2 px-3 rounded ${activeMenu === 'usuarios' ? 'bg-primary' : ''}`}
                onClick={() => navigateTo('usuarios', '/usuarios')}
              >
                👥 Usuarios (Módulo Protegido)
              </button>
            </ProtectedComponent>

            <ProtectedComponent module="Ventas" action="read">
              <button
                className={`nav-link btn text-start text-white border-0 py-2 px-3 rounded ${activeMenu === 'ventas' ? 'bg-primary' : ''}`}
                onClick={() => navigateTo('ventas', '/ventas')}
              >
                💰 Ventas (Módulo Protegido)
              </button>
            </ProtectedComponent>

            <ProtectedComponent module="Clientes" action="read">
              <button
                className={`nav-link btn text-start text-white border-0 py-2 px-3 rounded ${activeMenu === 'clientes' ? 'bg-primary' : ''}`}
                onClick={() => navigateTo('clientes', '/clientes')}
              >
                👥 Clientes (Módulo Protegido)
              </button>
            </ProtectedComponent>
          </nav>

          <div className="mt-auto border-top border-secondary pt-3">
            <div className="mb-2 text-white-50 text-truncate">
              👤 {user?.email}
            </div>
            <button className="btn btn-outline-danger w-100 btn-sm" onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar */}
        <header className="navbar navbar-expand navbar-white navbar-light bg-white border-bottom px-3 py-2 shadow-sm">
          <button className="btn btn-outline-secondary btn-sm me-3" onClick={toggleSidebar}>
            ☰
          </button>
          <span className="navbar-brand fw-semibold m-0">Consola del Sistema</span>
        </header>

        {/* Content Container */}
        <main className="p-4 flex-grow-1">
          <div className="container-fluid">
            {activeMenu === 'dashboard' && (
              <div>
                <h2>Dashboard Principal</h2>
                <p>Bienvenido al boilerplate de administración altamente escalable.</p>

                <div className="row g-3 mt-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="card text-white bg-info mb-3">
                      <div className="card-body">
                        <h5 className="card-title">Nuevos Pedidos</h5>
                        <p className="card-text fs-3 fw-bold">150</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="card text-white bg-success mb-3">
                      <div className="card-body">
                        <h5 className="card-title">Tasa de Rebote</h5>
                        <p className="card-text fs-3 fw-bold">53.8%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border rounded">
                  <h4>Componentes React Protegidos Demostrativos</h4>
                  <p>A continuación se evalúa el comportamiento de componentes condicionales según el JWT actual.</p>

                  <div className="d-flex gap-3 mt-3">
                    {/* Elemento ocultado si no tiene permiso */}
                    <ProtectedComponent module="Ventas" action="create">
                      <button className="btn btn-success">
                        + Nueva Venta (Requiere Ventas:create)
                      </button>
                    </ProtectedComponent>

                    {/* Elemento deshabilitado si no tiene permiso */}
                    <ProtectedComponent module="Ventas" action="delete" behavior="disable">
                      <button className="btn btn-danger">
                        Eliminar Registro (Requiere Ventas:delete)
                      </button>
                    </ProtectedComponent>

                    {/* Elemento ocultado si no tiene permiso */}
                    <ProtectedComponent module="Ventas" action="update">
                      <button className="btn btn-warning">
                        Editar Venta (Oculto - Requiere Ventas:update)
                      </button>
                    </ProtectedComponent>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'usuarios' && (
              <UsuariosPage />
            )}

            {activeMenu === 'ventas' && (
              <div>
                <h2>Módulo de Ventas</h2>
                <p>Estás visualizando este contenido porque tu JWT incluye el permiso para leer el módulo de <strong>Ventas</strong>.</p>
              </div>
            )}

            {activeMenu === 'clientes' && (
              <div>
                <h2>Módulo de Clientes</h2>
                <p>Estás visualizando este contenido porque tu JWT incluye el permiso para leer el módulo de <strong>Clientes</strong>.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
