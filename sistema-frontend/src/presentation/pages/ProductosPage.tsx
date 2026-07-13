import React, { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto } from '../../core/api/productos.api';
import { ProtectedComponent } from '../components/ProtectedComponent';

interface Product {
  _id: string;
  nombre: string;
  codigoBarras: string;
  descripcion?: string;
  categoria: string;
  precio: number;
  stock: number;
  status: string;
  createdAt: string;
}

export const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Creation Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    codigoBarras: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    stock: 0,
    status: 'ACTIVO',
  });

  // Edition Modal States
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    codigoBarras: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    stock: 0,
    status: 'ACTIVO',
  });

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductos();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleOpenModal = () => {
    setForm({
      nombre: '',
      codigoBarras: '',
      descripcion: '',
      categoria: '',
      precio: 0,
      stock: 0,
      status: 'ACTIVO',
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenEditModal = (producto: Product) => {
    setProductoSeleccionado(producto);
    setEditForm({
      nombre: producto.nombre,
      codigoBarras: producto.codigoBarras,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      status: producto.status,
    });
    setSubmitError(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProductoSeleccionado(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
      };

      await createProducto(payload);
      setShowModal(false);
      await fetchProductos();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado) return;
    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        ...editForm,
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
      };

      await updateProducto(productoSeleccionado._id, payload);
      setShowEditModal(false);
      setProductoSeleccionado(null);
      // Refresh list on success
      await fetchProductos();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar los cambios del producto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="h3 m-0 text-gray-800">Gestión de Productos</h2>
        <span className="text-muted">Módulo comercial protegido</span>
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
            <h5 className="m-0 text-white fw-bold">📦 Lista de Productos</h5>
            <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.85rem' }}>{productos.length} Registros</span>
          </div>
          <ProtectedComponent module="Productos" action="create">
            <button
              className="btn btn-success btn-sm fw-semibold"
              onClick={handleOpenModal}
            >
              ➕ Agregar Producto
            </button>
          </ProtectedComponent>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered m-0 align-middle">
              <thead className="table-secondary text-uppercase text-muted" style={{ fontSize: '0.85rem' }}>
                <tr>
                  <th style={{ width: '150px' }}>Código</th>
                  <th>Nombre del Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th style={{ width: '120px' }}>Estado</th>
                  <th style={{ width: '150px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No se encontraron productos disponibles.
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto._id}>
                      <td>
                        <code className="text-primary fw-bold">{producto.codigoBarras}</code>
                      </td>
                      <td>
                        <div>
                          <span className="fw-semibold">{producto.nombre}</span>
                          {producto.descripcion && (
                            <small className="d-block text-muted text-truncate" style={{ maxWidth: '300px' }}>
                              {producto.descripcion}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary text-uppercase px-2 py-1.5" style={{ fontSize: '0.75rem' }}>
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="fw-semibold">
                        ${producto.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`fw-bold ${producto.stock <= 5 ? 'text-danger' : 'text-dark'}`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 ${
                          producto.status === 'ACTIVO' ? 'bg-success' : 'bg-danger'
                        }`} style={{ fontSize: '0.75rem' }}>
                          {producto.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <ProtectedComponent module="Productos" action="update">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleOpenEditModal(producto)}
                            >
                              Editar
                            </button>
                          </ProtectedComponent>
                          <ProtectedComponent module="Productos" action="delete">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => console.log('acción clickeada: eliminar producto', producto._id)}
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
                  <h5 className="modal-title fw-bold">➕ Agregar Nuevo Producto</h5>
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
                      <label className="form-label fw-semibold">Nombre del Producto</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Arroz Integral Fino 1kg"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Código de Barras</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. 7791234567890"
                        value={form.codigoBarras}
                        onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Descripción (Opcional)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Detalles sobre el producto..."
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Categoría</label>
                        <select
                          className="form-select"
                          value={form.categoria}
                          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                          required
                        >
                          <option value="">Selecciona...</option>
                          <option value="ALIMENTOS">ALIMENTOS</option>
                          <option value="UTENSILIOS">UTENSILIOS</option>
                          <option value="OTROS">OTROS</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Estado</label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          required
                        >
                          <option value="ACTIVO">ACTIVO</option>
                          <option value="INACTIVO">INACTIVO</option>
                        </select>
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Precio ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0.00"
                          step="0.01"
                          value={form.precio === 0 ? '' : form.precio}
                          onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                          required
                          min="0.01"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Stock Inicial</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          value={form.stock === 0 ? '' : form.stock}
                          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
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
                        'Agregar Producto'
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
      {showEditModal && productoSeleccionado && (
        <>
          <div className="modal show d-block fade" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">✏️ Editar Producto</h5>
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
                      <label className="form-label fw-semibold">Nombre del Producto</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Arroz Integral Fino 1kg"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Código de Barras</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. 7791234567890"
                        value={editForm.codigoBarras}
                        onChange={(e) => setEditForm({ ...editForm, codigoBarras: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Descripción (Opcional)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Detalles sobre el producto..."
                        value={editForm.descripcion}
                        onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Categoría</label>
                        <select
                          className="form-select"
                          value={editForm.categoria}
                          onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                          required
                        >
                          <option value="">Selecciona...</option>
                          <option value="ALIMENTOS">ALIMENTOS</option>
                          <option value="UTENSILIOS">UTENSILIOS</option>
                          <option value="OTROS">OTROS</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Estado</label>
                        <select
                          className="form-select"
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          required
                        >
                          <option value="ACTIVO">ACTIVO</option>
                          <option value="INACTIVO">INACTIVO</option>
                        </select>
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Precio ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0.00"
                          step="0.01"
                          value={editForm.precio === 0 ? '' : editForm.precio}
                          onChange={(e) => setEditForm({ ...editForm, precio: Number(e.target.value) })}
                          required
                          min="0.01"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Stock</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0"
                          value={editForm.stock === 0 ? '0' : editForm.stock}
                          onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                          required
                          min="0"
                        />
                      </div>
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
