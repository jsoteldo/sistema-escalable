import React, { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario } from '../../core/api/usuarios.api';
import { ProtectedComponent } from '../components/ProtectedComponent';

interface User {
  _id: string;
  name: string;
  email: string;
  status: string;
  role?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Creation Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rol_id: '',
  });

  // Edition Modal States
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    rol_id: '',
    status: '',
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuarios();
      setUsuarios(data);

      // Extract unique roles dynamically from returned user objects
      const extractedRoles = Array.from(
        new Map(
          data
            .filter((u: any) => u.role && u.role._id && u.role.name)
            .map((u: any) => [u.role._id, { _id: u.role._id, name: u.role.name }])
        ).values()
      );
      setAvailableRoles(extractedRoles as any);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenModal = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      rol_id: '',
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenEditModal = (usuario: User) => {
    setUsuarioSeleccionado(usuario);
    setEditForm({
      rol_id: usuario.role?._id || '',
      status: usuario.status,
    });
    setSubmitError(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setUsuarioSeleccionado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError(null);
      await createUsuario(form);
      setShowModal(false);
      await fetchUsuarios();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      await updateUsuario(usuarioSeleccionado._id, editForm);
      setShowEditModal(false);
      setUsuarioSeleccionado(null);
      // Refresh the table reactively on success
      await fetchUsuarios();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al actualizar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="h3 m-0 text-gray-800">Gestión de Usuarios</h2>
        <span className="text-muted">Módulo administrativo protegido</span>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* AdminLTE Card Style */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-3">
            <h5 className="m-0 text-white fw-bold">👥 Lista de Usuarios</h5>
            <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.85rem' }}>{usuarios.length} Registros</span>
          </div>
          <ProtectedComponent module="Usuarios" action="create">
            <button
              className="btn btn-success btn-sm fw-semibold"
              onClick={handleOpenModal}
            >
              ➕ Nuevo Usuario
            </button>
          </ProtectedComponent>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered m-0 align-middle">
              <thead className="table-secondary text-uppercase text-muted" style={{ fontSize: '0.85rem' }}>
                <tr>
                  <th style={{ width: '180px' }}>ID</th>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th style={{ width: '130px' }}>Rol</th>
                  <th style={{ width: '140px' }}>Estado</th>
                  <th style={{ width: '220px' }}>Creado el</th>
                  <th style={{ width: '180px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No se encontraron usuarios disponibles.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario._id}>
                      <td>
                        <code className="text-primary">{usuario._id}</code>
                      </td>
                      <td>
                        <span className="fw-semibold">{usuario.name || 'N/A'}</span>
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className="badge bg-info text-dark text-uppercase px-2 py-1.5" style={{ fontSize: '0.75rem' }}>
                          {usuario.role?.name || 'USER'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 ${
                          usuario.status === 'ACTIVO' ? 'bg-success' :
                          usuario.status === 'PENDIENTE' ? 'bg-warning text-dark' : 'bg-danger'
                        }`} style={{ fontSize: '0.75rem' }}>
                          {usuario.status}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.9rem' }}>
                        {new Date(usuario.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <ProtectedComponent module="Usuarios" action="update">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleOpenEditModal(usuario)}
                            >
                              Editar
                            </button>
                          </ProtectedComponent>
                          <ProtectedComponent module="Usuarios" action="delete">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => console.log('acción clickeada: eliminar', usuario._id)}
                            >
                              Eliminar
                            </button>
                          </ProtectedComponent>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pure Bootstrap 5 Creation Modal */}
      {showModal && (
        <>
          <div className="modal show d-block fade" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">➕ Crear Nuevo Usuario</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal} aria-label="Close"></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body text-dark">
                    {submitError && (
                      <div className="alert alert-danger" role="alert">
                        <strong>⚠️ Error:</strong> {submitError}
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nombre Completo</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Correo Electrónico</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john.doe@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Rol del Usuario</label>
                      <select
                        className="form-select"
                        value={form.rol_id}
                        onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
                        required
                      >
                        <option value="">Selecciona un rol...</option>
                        {availableRoles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success fw-semibold" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        'Guardar Usuario'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pure Bootstrap 5 Edition Modal */}
      {showEditModal && usuarioSeleccionado && (
        <>
          <div className="modal show d-block fade" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">✏️ Editar Rol y Estado</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseEditModal} aria-label="Close"></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body text-dark">
                    {submitError && (
                      <div className="alert alert-danger" role="alert">
                        <strong>⚠️ Error:</strong> {submitError}
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Usuario</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={`${usuarioSeleccionado.name} (${usuarioSeleccionado.email})`}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Estado de Cuenta</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        required
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Rol Asignado</label>
                      <select
                        className="form-select"
                        value={editForm.rol_id}
                        onChange={(e) => setEditForm({ ...editForm, rol_id: e.target.value })}
                        required
                      >
                        <option value="">Selecciona un rol...</option>
                        {availableRoles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal} disabled={submitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary fw-semibold" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Actualizando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
