import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { menuItemsAdmin, superAdminMenuItems } from '../config/layout/sidebar';
import SearchBox from '../components/search-box';
import AdminTable from './adminTable';
import Modal from '../components/admin-edit-modal';
import ActionComponents from '../components/action-components';
import CreatePetForm from '../components/createPetFormAdmin';
import UpdatePetForm from '../components/updatePetFormAdmin';
import PetDetail from '../components/petDetailAdmin';
const API_URL = import.meta.env.VITE_API_URL;

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

function AdminPet() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expedientes, setExpedientes] = useState([]);
  const [owners, setOwners] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const token = localStorage.getItem('token');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateId, setDeactivateId] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const adminTypeId = localStorage.getItem('admin_type_id');
  const isRoot = adminTypeId === '1';
  const sidebarItems = isRoot ? superAdminMenuItems : menuItemsAdmin;
  const userType = isRoot ? 'superadmin' : 'admin';

  const [createForm, setCreateForm] = useState({
    nombre: '',
    dueño: '',
    peso: '',
    fecha: '',
    especie: '',
    raza: ''
  });

  const [updateForm, setUpdateForm] = useState({
    id: '',
    name: '',
    breed: ''
  });

  useEffect(() => {
    fetch(`${API_URL}/api/pets`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setExpedientes(Array.isArray(data) ? data : []))
      .catch(err => Swal.fire({
        icon: 'error',
        title: 'Error al cargar expedientes',
        text: err.message || 'No se pudieron cargar los expedientes.',
      }));

    fetch(`${API_URL}/api/users`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setOwners(data.filter(u => u.role_id === 1)))
      .catch(err => Swal.fire({
        icon: 'error',
        title: 'Error al cargar dueños',
        text: err.message || 'No se pudieron cargar los dueños.',
      }));
    fetch(`${API_URL}/api/species`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setSpeciesList(data))
      .catch(err => Swal.fire({
        icon: 'error',
        title: 'Error al cargar especies',
        text: err.message || 'No se pudieron cargar las especies.',
      }));
  }, [token]);

  useEffect(() => {
    if (!ownerSearch) {
      setOwnerSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      const duiRegex = /^\d{8}-\d$/;
      const queryParam = duiRegex ? `?dui=${ownerSearch}` : `?search=${encodeURIComponent(ownerSearch)}`;
      const url = `${API_URL}/api/users${queryParam}`;

      fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      })
        .then(r => r.json())
        .then(data => setOwnerSuggestions(data))
        .catch(err => Swal.fire({
          icon: 'error',
          title: 'Error al buscar dueños',
          text: err.message || 'No se pudieron obtener sugerencias.',
        }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [ownerSearch, token]);

  const petColumns = ['Nombre', 'Especie', 'Raza', 'Dueño', 'Ver'];
  useEffect(() => {
    const mapped = expedientes.map((pet, i) => ({
      id: pet.id,
      key: pet.id,
      '#': i + 1,
      Nombre: pet.name,
      Especie: pet.species?.name || '',
      Raza: pet.breed,
      Dueño: pet.owner?.full_name || '',
      Ver: (
        <button
          onClick={() => handleOpenDetail(pet.id)}
          style={{
            backgroundColor: '#374f59',
            color: '#fff',
            border: 'none',
            margin: '1rem',
            borderRadius: '0.25rem',
          }}
        >
          Detalles
        </button>
      )
    }));
    setRows(mapped);
    setLoading(false);

  }, [expedientes]);

  const handleSearch = term => setSearchTerm(term);
  const filteredRows = rows.filter(r =>
    r.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleDeactivate(id) {
    setDeactivateId(id);
    setShowDeactivateModal(true);
  }


  async function confirmDeactivate() {
    try {
      const res = await fetch(`${API_URL}/api/pets/${deactivateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status_id: 2 })
      });
      const updated = await res.json();
      setExpedientes(prev =>
        prev.map(p => p.id === updated.id ? updated : p)
      );
      Swal.fire({
        icon: 'success',
        title: 'Mascota inactiva',
        text: 'Estatus actualizado con éxito'
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    } finally {
      setShowDeactivateModal(false);
      setDeactivateId(null);
    }
  }

  function cancelDeactivate() {
    setShowDeactivateModal(false);
    setDeactivateId(null);
  }


  function handleOpenUpdate(id) {
    const pet = expedientes.find(p => p.id === id);
    if (!pet) return;
    setUpdateForm({
      id: pet.id,
      name: pet.name || '',
      breed: pet.breed || ''
    });
    setShowUpdateModal(true);
  }

  async function handleOpenDetail(id) {
    try {
      const res = await fetch(`${API_URL}/api/pets/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
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
  }

  async function handleUpdateSubmit(form) {
    try {
      const res = await fetch(
        `${API_URL}/api/pets/${form.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            name: form.name,
            breed: form.breed,
            status_id: form.status_id
          })
        }
      );
      const updated = await res.json();
      setExpedientes(prev =>
        prev.map(x => (x.id === updated.id ? updated : x))
      );
      setShowUpdateModal(false);

      await Swal.fire({
        icon: 'success',
        title: 'Mascota actualizada',
        text: 'Información de mascota actualizada correctamente.',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  }

  const initialCreateForm = {
    nombre: '',
    dueño: '',
    peso: '',
    fecha: '',
    especie: '',
    raza: ''
  };

  async function handleCreateSubmit(form) {
    try {
      const body = {
        owner_id: form.dueño,
        name: form.nombre,
        birth_date: new Date(form.fecha).toISOString(),
        weight_kg: parseFloat(form.peso),
        species_id: parseInt(form.especie, 10),
        breed: form.raza,
        status_id: 1
      };
      const res = await fetch(`${API_URL}/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorText = await res.text();
        return Swal.fire({
          icon: 'error',
          title: 'Error al crear mascota',
          text: errorText
        });
      }

      const newPet = await res.json();
      setExpedientes(prev => [newPet, ...prev]);
      setShowCreateModal(false);
      setCreateForm(initialCreateForm);

      await Swal.fire({
        icon: 'success',
        title: 'Mascota creada',
        text: 'Información de la mascota registrada correctamente.',
        showConfirmButton: false
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  }

  return (
    //<Layout menuItems={sidebarItems} userType={userType} >
    <Layout menuItems={menuItemsAdmin} userType="admin">
      <div id="admin-main-container" className="vh-100 overflow-auto pb-5">
        <h2 className="records-header__title mb-0 me-3" style={{
          //backgroundColor: '#374f59',
          height: '3rem',
          width: '400px',
          color: '#374f59',
          //padding: arriba derecha abajo izquierda;
          //padding: '1rem 1rem 2rem 3rem',
          // margin: '1rem 1.2rem 0.5rem 5rem',
          margin: '1rem 9rem 0.5rem 1.5rem',
          border: 'none',
          borderRadius: '50px',
          fontSize: '3rem',
          fontWeight: 600,
          alignItems: 'center',
          justifyContent: 'center',
        }}>Mascotas</h2>


        <SearchBox
          onSearch={handleSearch}
          placeholder="Buscar"
        />
        <button
          className="btn btn-open-new"
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#374f59',
            height: '3rem',
            width: '350px',
            color: '#fff',
            //padding: arriba derecha abajo izquierda;
            //padding: '1rem 1rem 2rem 3rem',
            margin: '0.5rem 1rem 0.5rem 1rem',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: 600,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Agregar mascota
        </button>

        {loading && <p>Cargando mascotas…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <div className="mb-5">
            <AdminTable rows={filteredRows} columns={petColumns} onEdit={handleOpenUpdate}
              onDelete={handleDeactivate}
              onView={handleOpenDetail} />
          </div>
        )}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}

        >
          <CreatePetForm
            form={createForm}
            setForm={setCreateForm}
            owners={owners}
            species={speciesList}
            onSubmit={handleCreateSubmit}
          />
        </Modal>

        <Modal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        >
          {updateForm.id ? (
            <UpdatePetForm
              form={updateForm}
              setForm={setUpdateForm}
              onSubmit={handleUpdateSubmit}
            />
          ) : (
            <p>Cargando datos...</p>
          )}
        </Modal>

        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        >
          <PetDetail data={detailData} />
        </Modal>

        <Modal
          isOpen={showDeactivateModal}
          onClose={cancelDeactivate}
        >
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p>¿Desea marcar esta mascota como inactiva?</p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={confirmDeactivate}
                style={{
                  backgroundColor: '#374f59',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Aceptar
              </button>
              <button
                onClick={cancelDeactivate}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </Layout>
  );
}

export default AdminPet;