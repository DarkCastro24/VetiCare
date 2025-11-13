import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { menuItemsVet, menuItemsOwner } from '../config/layout/sidebar';
import '../assets/styles/main.scss';
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

const ProfileVet = () => {
  const token = localStorage.getItem("token");
  const userFromLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = import.meta.env.VITE_API_URL;


  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [petAdded, setPetAdded] = useState(false);

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);
  const openAddPetModal = () => setShowAddPetModal(true);
  const closeAddPetModal = () => setShowAddPetModal(false);

  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedDui, setEditedDui] = useState("");
  const [editedPhone, setEditedPhone] = useState("");


  const [name, setName] = useState("Toffie");
  const [birthDate, setBirthDate] = useState("2023-05-15");
  const [speciesId, setSpeciesId] = useState("2");
  const [breed, setBreed] = useState("Tabby");

  const user = {
    id: userFromLocal["id"],
    nombre: userFromLocal["full_name"],
    email: userFromLocal["email"],
    telefono: userFromLocal["phone"],
    dui: userFromLocal["dui"],
    role: userFromLocal["role_id"] === 2 ? 'vet' : 'owner',
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
        if (userLocal?.role_id === 1) {
          const result = await getPets(userLocal.id);
          setMascotas(result || []);
        }
      } catch (error) {
        console.error("Error fetching pets or parsing user:", error);
      }
    };
    fetchPets();
  }, [petAdded]);

  useEffect(() => {
    if (userFromLocal) {
      setEditedName(userFromLocal.full_name);
      setEditedEmail(userFromLocal.email);
      setEditedDui(userFromLocal.dui);
      setEditedPhone(userFromLocal.phone);
    }
  }, []);



  async function getPets(userId) {
    try {
      const response = await fetch(`${API_URL}/api/pets/owner/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const filteredData = data.map((item) => ({
        name: item.name
      }));
      console.log('Filtered data:', filteredData);
      return filteredData;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  const handleSubmitPet = async (e) => {
    const parsed = new Date(`${birthDate}T00:00:00Z`).toISOString()
      .replace(".000Z", "Z");
    e.preventDefault();
    const payload = {
      owner_id: user.id,
      name: name,
      birth_date: parsed,
      species_id: parseInt(speciesId),
      breed: breed
    };
    try {
      const response = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        closeAddPetModal();
        setPetAdded(prev => !prev)
      } else {
        closeAddPetModal();
        const errorText = await response.text();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorText,
        });
      }
    } catch (err) {
      closeAddPetModal();
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      full_name: editedName,
      email: editedEmail,
      phone: editedPhone,
    };
    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...storedUser,
          full_name: editedName,
          email: editedEmail,
          phone: editedPhone,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        closeEditModal();
      } else {
        closeEditModal();
        const errorText = await response.text();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorText,
        });
      }
    } catch (err) {
      closeEditModal();
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo conectar con el servidor.',
      });
    }

  }

  return (
    <>
      <Layout menuItems={user.role === "owner" ? menuItemsOwner : menuItemsVet} userType="vet">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar" />
              {/* Solo aquí va la negrita */}
              <h2>
                {user.role === 'owner' ? (
                  <span className="vet-name">{user.nombre}</span>
                ) :
                  <span className="vet-name"> Dr. {user.nombre}</span>
                }
              </h2>
            </div>

            <div className="profile-fields">
              <div>
                <label>Nombre</label>
                {/* Aquí NO va la negrita */}
                <div className="field-box">{user.nombre}</div>
              </div>
              <div>
                <label>Email</label>
                <div className="field-box">{user.email}</div>
              </div>
              <div>
                <label>Teléfono</label>
                <div className="field-box">{user.telefono}</div>
              </div>
              {user.role == "owner" ? (
                <div className="mascota-wrapper">
                  <label>Mascota</label>
                  <div className="field-box">{mascotas[0]?.name}</div>
                  <button className="btn-circle-outside" onClick={openAddPetModal}>+</button>
                </div>
              ) :
                <></>
              }
            </div>

            <div className="profile-actions">
              <button className="btn-main btn-normal" onClick={openEditModal}>Actualizar perfil</button>
            </div>
          </div>
        </div>
      </Layout>
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <button className="modal-close" onClick={closeEditModal}>×</button>
            {/* Solo aquí va la negrita */}
            <h2><span className="vet-name">{userFromLocal["full_name"]}</span></h2>

            <form onSubmit={handleProfileUpdate}>
              <div className="edit-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                />
              </div>
              <div className="edit-group horizontal">
                <label>Email</label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  required
                />
                <label>DUI</label>
                <input
                  type="text"
                  value={editedDui}
                  onChange={(e) => setEditedDui(e.target.value)}
                  disabled
                />
                <label>Teléfono</label>
                <input
                  type="text"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  required
                />
              </div>
              {user.role === "owner" && (
                <>
                  <h3 className="related-title">Expedientes relacionados</h3>
                  <div className="pet-tags">
                    {mascotas.map((m) => (
                      <div key={m.name} className="pet-tag">{m.name}</div>
                    ))}
                  </div>
                </>
              )}
              <div className="button-container">
                <button type="submit" className="btn-modal-submit" id='edit-profile-data'>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddPetModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <button className="modal-close" onClick={closeAddPetModal}>×</button>
            <h2>Registra otra mascota</h2>
            <form onSubmit={handleSubmitPet}>
              <label>Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              <label>Fecha de nacimiento</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
              <label>Especie</label>
              <select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)} required>
                <option value="1">Perro</option>
                <option value="2">Gato</option>
                <option value="3">Ave</option>
              </select>
              <label>Raza</label>
              <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required />
              <button type="submit" className="btn-modal-submit">Registrar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileVet;
