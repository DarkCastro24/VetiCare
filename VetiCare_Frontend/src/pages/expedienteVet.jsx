import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Layout from './layout';
import { menuItemsVet } from '../config/layout/sidebar';
const API_URL = import.meta.env.VITE_API_URL;
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

const ExpedienteVet = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [form, setForm] = useState({
    nombre: '', dueño: '', peso: '', fecha: '', especie: '', raza: '',
    enfermedad: '', medicina: '', cirugias: '', vacunas: []
  });
  const [updateForm, setUpdateForm] = useState({ id: '', name: '', breed: '' });
  const [speciesList, setSpeciesList] = useState([]);

  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState({ id: '', full_name: '' });

  const token = localStorage.getItem('token');

  const [detailData, setDetailData] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/pets/active`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
      .then(res => res.json())
      .then(data => setExpedientes(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error al cargar expedientes:', err));

    fetch(`${API_URL}/api/users`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
      .then(res => res.json())
      .then(data => setOwners(data.filter(u => u.role_id === 1)))
      .catch(err => console.error('Error al cargar dueños:', err));

    fetch(`${API_URL}/api/species`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
      .then(res => res.json())
      .then(data => setSpeciesList(data))
      .catch(err => console.error('Error al cargar especies:', err));

    if (!ownerSearch) {
      setOwnerSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      // Si parece un DUI completo (ej: '01234567-8'), busca por DUI exacto
      const duiRegex = /^\d{8}-\d$/;
      const url = duiRegex.test(ownerSearch)
        ? `/api/users?dui=${ownerSearch}`
        : `/api/users?search=${encodeURIComponent(ownerSearch)}`;

      fetch(`${API_URL}${url}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
        .then(r => r.json())
        .then(data => {
          setOwnerSuggestions(data);
        })
        .catch(() => setOwnerSuggestions([]));
    }, 300);

    return () => clearTimeout(timeout);

  }, [ownerSearch, token]);

  const filteredExpedientes = expedientes.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este expediente?')) return;
    try {
      await fetch(`${API_URL}/api/pets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setExpedientes(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const body = {
      owner_id: form.dueño,
      name: form.nombre,
      birth_date: new Date(form.fecha).toISOString(),
      weight_kg: parseFloat(form.peso),
      species_id: parseInt(form.especie, 10),
      breed: form.raza,
      status_id: 1
    };

    try {
      const res = await fetch(`${API_URL}/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      });
      const newExp = await res.json();
      setExpedientes(prev => [newExp, ...prev]);
      setShowModal(false);
      setForm({ nombre: '', dueño: '', peso: '', fecha: '', especie: '', raza: '', enfermedad: '', medicina: '', cirugias: '', vacunas: [] });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  const handleOpenUpdate = exp => {
    setUpdateForm({ id: exp.id, name: exp.name, breed: exp.breed });
    setShowUpdateModal(true);
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/pets/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      setDetailData(data);
      setShowDetailModal(true);
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  const handleUpdateSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/pets/${updateForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ name: updateForm.name, breed: updateForm.breed })
      });
      const updated = await res.json();
      setExpedientes(prev => prev.map(x => x.id === updated.id ? updated : x));
      setShowUpdateModal(false);
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  const handleSelectOwner = u => {
    setSelectedOwner(u);
    setOwnerSearch(u.full_name);
    setOwnerSuggestions([]);
    handleChange('dueño', u.id);
  };

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleVacunaChange = (idx, field, value) => {
    setForm(f => { const cvs = [...f.vacunas]; cvs[idx][field] = value; return { ...f, vacunas: cvs }; });
  };
  const handleAddVacuna = () => setForm(f => ({ ...f, vacunas: [...f.vacunas, { nombre: '', fecha: '' }] }));
  const handleRemoveVacuna = idx => setForm(f => ({ ...f, vacunas: f.vacunas.filter((_, i) => i !== idx) }));
  const handleUpdateChange = (field, value) => setUpdateForm(f => ({ ...f, [field]: value }));

  return (
    <Layout menuItems={menuItemsVet} userType="vet">
      <div className="expedientes-page">
        <h2 className="records-header__title mb-0 me-3">Expedientes</h2>
        <div className="toolbar d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
          <div className="search-wrapper d-flex align-items-center mb-2 mb-md-0">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
          <div className="records-header d-flex align-items-center">
            <button className="btn btn-open-new" onClick={() => setShowModal(true)}>
              Registrar nueva mascota
            </button>
          </div>
        </div>

        <section className="records-list">
          {filteredExpedientes.length > 0 ? (
            filteredExpedientes.map((e, idx) => (
              <div key={e.id} className="record-item d-flex align-items-center mb-2">
                <span className="record-item__id">
                  {String(idx + 1).padStart(5, '0')}
                </span>
                <button className="btn btn-vet-exp" onClick={() => handleOpenDetail(e.id)}> <FaSearch className="search-icon" /></button>
                <span className="record-item__name flex-fill">{e.name}</span>
                <span className="record-item__date">{new Date(e.birth_date).toLocaleDateString('es-ES')}</span>
                <span className="record-item__created">{new Date(e.created_at).toLocaleDateString('es-ES')}</span>
                {/* <button className="btn btn-remove" onClick={() => handleDelete(e.id)}><FaTimes /></button> */}
                <button className="btn btn-update ms-2" style={{ marginTop: '10px' }} onClick={() => handleOpenUpdate(e)}>Update</button>
              </div>
            ))
          ) : (<p className="text-muted">No se encontraron expedientes.</p>)}
        </section>
        {showModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Nuevo expediente</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Nombre</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.nombre}
                            onChange={e => handleChange('nombre', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6 position-relative">
                          <label className="form-label">Dueño</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Busca por nombre o ingresa DUI"
                            value={ownerSearch}
                            onChange={e => {
                              setOwnerSearch(e.target.value);
                              handleChange('dueño', '');
                            }}
                            required
                          />
                          {ownerSuggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                              {ownerSuggestions.map(u => (
                                <li
                                  key={u.id}
                                  className="list-group-item list-group-item-action"
                                  onMouseDown={() => handleSelectOwner(u)}
                                >
                                  {u.full_name} {u.dui && `(${u.dui})`}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Peso (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={form.peso}
                            onChange={e => handleChange('peso', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Fecha de nacimiento</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.fecha}
                            onChange={e => handleChange('fecha', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Especie</label>
                          <select
                            className="form-select"
                            value={form.especie}
                            onChange={e => handleChange('especie', e.target.value)}
                            required
                          >
                            <option value="">Seleccione especie</option>
                            {speciesList.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Raza</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.raza}
                            onChange={e => handleChange('raza', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Enfermedad crónica</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.enfermedad}
                            onChange={e => handleChange('enfermedad', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Medicina permanente</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.medicina}
                            onChange={e => handleChange('medicina', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Cirugías anteriores</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.cirugias}
                            onChange={e => handleChange('cirugias', e.target.value)}
                          />
                        </div>
                      </div>
                      <section className="vaccination-history mt-4">
                        <h5 className="vaccination-history__title">Historial de vacunación</h5>
                        <table className="table vaccination-history__table mb-2">
                          <thead>
                            <tr><th>#</th><th>Vacuna</th><th>Fecha</th><th></th></tr>
                          </thead>
                          <tbody>
                            {form.vacunas.map((v, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td><input type="text" className="form-control" value={v.nombre} onChange={e => handleVacunaChange(i, 'nombre', e.target.value)} /></td>
                                <td><input type="date" className="form-control" value={v.fecha} onChange={e => handleVacunaChange(i, 'fecha', e.target.value)} /></td>
                                <td><button type="button" className="btn btn-sm btn-remove" onClick={() => handleRemoveVacuna(i)}><FaTimes /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button type="button" className="btn btn-sm btn-link" onClick={handleAddVacuna}>+ Agregar vacuna</button>
                      </section>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {showUpdateModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Actualizar expediente</h5>
                    <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)} />
                  </div>
                  <form onSubmit={handleUpdateSubmit}>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Nombre</label>
                          <input
                            type="text"
                            className="form-control"
                            value={updateForm.name}
                            onChange={e => handleUpdateChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Raza</label>
                          <input
                            type="text"
                            className="form-control"
                            value={updateForm.breed}
                            onChange={e => handleUpdateChange('breed', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary">Actualizar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {showDetailModal && detailData && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div
              className="modal fade show"
              style={{ display: 'block' }}
              tabIndex="-1"
              onClick={() => setShowDetailModal(false)}
            >
              <div
                className="modal-dialog modal-sm modal-dialog-centered"
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Detalle de {detailData.name}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDetailModal(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <p><strong>Nombre mascota:</strong> {detailData.name}</p>
                    <p><strong>Dueño:</strong> {detailData.owner.full_name}</p>
                    <p><strong>Teléfono:</strong> {detailData.owner.phone}</p>
                    <p><strong>Especie:</strong> {detailData.species.name}</p>
                    <p><strong>Raza:</strong> {detailData.breed}</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </Layout>
  );
};

export default ExpedienteVet;