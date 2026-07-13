import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente, Cliente } from '../../core/api/clientes.api';
import { ProtectedComponent } from '../components/ProtectedComponent';

export const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Creation Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  // Edition Modal States
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    status: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  });

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientes();
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenModal = () => {
    setForm({
      nombre: '',
      documento: '',
      email: '',
      telefono: '',
      direccion: '',
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenEditModal = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setEditForm({
      nombre: cliente.nombre,
      documento: cliente.documento,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      status: cliente.status,
    });
    setSubmitError(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setClienteSeleccionado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError(null);
      await createCliente(form);
      setShowModal(false);
      await fetchClientes();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      await updateCliente(clienteSeleccionado._id, editForm);
      setShowEditModal(false);
      setClienteSeleccionado(null);
      await fetchClientes();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al actualizar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cliente: Cliente) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar al cliente "${cliente.nombre}"?`);
    if (!confirmDelete) return;

    try {
      await deleteCliente(cliente._id);
      await fetchClientes();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el cliente');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando clientes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="h3 m-0 text-gray-800">Gestión de Clientes</h2>
        <span className="text-muted">Módulo administrativo de Clientes protegido</span>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Card Style */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-3">
            <h5 className="m-0 text-white fw-bold">👥 Lista de Clientes</h5>
            <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.85rem' }}>{clientes.length} Registros</span>
          </div>
          <ProtectedComponent module="Clientes" action="create">
            <button
              className="btn btn-success btn-sm fw-semibold"
              onClick={handleOpenModal}
            >
              ➕ Nuevo Cliente
            </button>
          </ProtectedComponent>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered m-0 align-middle">
              <thead className="table-secondary text-uppercase text-muted" style={{ fontSize: '0.85rem' }}>
                <tr>
                  <th>Documento</th>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th style={{ width: '140px' }}>Estado</th>
                  <th style={{ width: '180px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No se encontraron clientes registrados.
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente._id}>
                      <td>
                        <span className="fw-bold">{cliente.documento}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-primary">{cliente.nombre}</span>
                      </td>
                      <td>{cliente.email || <span className="text-muted italic">No registrado</span>}</td>
                      <td>{cliente.telefono || <span className="text-muted italic">No registrado</span>}</td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 ${
                          cliente.status === 'ACTIVO' ? 'bg-success' : 'bg-danger'
                        }`} style={{ fontSize: '0.75rem' }}>
                          {cliente.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <ProtectedComponent module="Clientes" action="update">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleOpenEditModal(cliente)}
                            >
                              Editar
                            </button>
                          </ProtectedComponent>
                          <ProtectedComponent module="Clientes" action="delete">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(cliente)}
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

      {/* Creation Modal */}
      {showModal && (
        <>
          <div className="modal show d-block fade" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">➕ Crear Nuevo Cliente</h5>
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
                        placeholder="Ej. Juan Pérez"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Documento (DNI/RUC/Pasaporte)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. 12345678"
                        value={form.documento}
                        onChange={(e) => setForm({ ...form, documento: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Correo Electrónico (Opcional)</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="juan.perez@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Teléfono (Opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. +51 987654321"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Dirección (Opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Av. Larco 123"
                        value={form.direccion}
                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      />
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
                        'Guardar Cliente'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edition Modal */}
      {showEditModal && clienteSeleccionado && (
        <>
          <div className="modal show d-block fade" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">✏️ Editar Cliente</h5>
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
                      <label className="form-label fw-semibold">Nombre Completo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Documento</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={editForm.documento}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Correo Electrónico (Opcional)</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Teléfono (Opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.telefono}
                        onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Dirección (Opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.direccion}
                        onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Estado</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                        required
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
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
