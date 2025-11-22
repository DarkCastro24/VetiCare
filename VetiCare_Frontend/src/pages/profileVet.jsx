import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { menuItemsVet, menuItemsOwner } from "../config/layout/sidebar";
import "../assets/styles/main.scss";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import pf2 from "../assets/images/profile_photos/2.png";
import pf3 from "../assets/images/profile_photos/3.png";
import pf4 from "../assets/images/profile_photos/4.png";
import pf5 from "../assets/images/profile_photos/5.png";
import pf6 from "../assets/images/profile_photos/6.png";
import pf7 from "../assets/images/profile_photos/7.png";
import pf8 from "../assets/images/profile_photos/8.png";

// Mapa de imágenes de perfil por id
const profileImages = {
  2: pf2,
  3: pf3,
  4: pf4,
  5: pf5,
  6: pf6,
  7: pf7,
  8: pf8,
};

const ProfileVet = () => {
  // Datos base del entorno y usuario autenticado
  const token = localStorage.getItem("token");
  const userFromLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para abrir/cerrar modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Lista de mascotas relacionadas al usuario (si es dueño)
  const [mascotas, setMascotas] = useState([]);

  // Campos editables del perfil
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedDui, setEditedDui] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

  // Estado para manejar foto de perfil actual y seleccionada
  const initialPf = userFromLocal.pf || 2;
  const [currentPf, setCurrentPf] = useState(initialPf);
  const [selectedPf, setSelectedPf] = useState(initialPf);

  // Handlers para modal de edición de perfil
  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  // Handlers para modal de selección de foto
  const openPhotoModal = () => setShowPhotoModal(true);
  const closePhotoModal = () => {
    setSelectedPf(currentPf);
    setShowPhotoModal(false);
  };

  // Objeto de usuario normalizado para la vista
  const user = {
    id: userFromLocal["id"],
    nombre: userFromLocal["full_name"],
    email: userFromLocal["email"],
    telefono: userFromLocal["phone"],
    dui: userFromLocal["dui"],
    role: userFromLocal["role_id"] === 2 ? "vet" : "owner",
  };

  // Carga de mascotas relacionadas solo si el usuario es dueño
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
  }, []);

  // Inicializa campos editables con los datos actuales del usuario
  useEffect(() => {
    if (userFromLocal) {
      setEditedName(userFromLocal.full_name);
      setEditedEmail(userFromLocal.email);
      setEditedDui(userFromLocal.dui);
      setEditedPhone(userFromLocal.phone);
      if (userFromLocal.pf) {
        setCurrentPf(userFromLocal.pf);
        setSelectedPf(userFromLocal.pf);
      }
    }
  }, []);

  // Consulta de mascotas por id de dueño
  async function getPets(userId) {
    try {
      const response = await fetch(`${API_URL}/api/pets/owner/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const filteredData = data.map((item) => ({
        id: item.id,
        name: item.name,
      }));
      return filteredData;
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  // Actualiza datos básicos de perfil en API y localStorage
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
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
          icon: "error",
          title: "Error",
          text: errorText,
        });
      }
    } catch (err) {
      closeEditModal();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo conectar con el servidor.",
      });
    }
  };

  // Actualiza la foto de perfil en API y localStorage
  const handleSaveProfilePhoto = async () => {
    try {
      const payload = { pf: selectedPf };

      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Swal.fire({
          icon: "error",
          title: "Error al actualizar foto de perfil",
          text: errorText,
        });
      }

      // Actualiza estado local con la nueva foto
      setCurrentPf(selectedPf);

      // Actualiza usuario en localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, pf: selectedPf };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      Swal.fire({
        icon: "success",
        title: "Foto de perfil actualizada",
      });

      closePhotoModal();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error.message || "No se pudo conectar con el servidor.",
      });
    }
  };

  // Determina qué imagen de perfil mostrar
  const currentProfileImage = profileImages[currentPf] || profileImages[2];

  // Render principal del perfil de usuario
  return (
    <>
      <Layout
        menuItems={user.role === "owner" ? menuItemsOwner : menuItemsVet}
        userType="vet"
      >
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                <img
                  src={currentProfileImage}
                  alt="Foto de perfil"
                  className="profile-avatar"
                />
                <button
                  type="button"
                  className="btn-change-photo"
                  onClick={openPhotoModal}
                >
                  Cambiar foto
                </button>
              </div>
              <h2>
                {user.role === "owner" ? (
                  <span className="vet-name">{user.nombre}</span>
                ) : (
                  <span className="vet-name">Dr. {user.nombre}</span>
                )}
              </h2>
            </div>

            <div className="profile-fields">
              <div>
                <label>Nombre</label>
                <div className="field-box">{user.nombre}</div>
              </div>
              <div>
                <label>DUI</label>
                <div className="field-box">{user.dui}</div>
              </div>
              <div>
                <label>Teléfono</label>
                <div className="field-box">{user.telefono}</div>
              </div>
              <div>
                <label>Email</label>
                <div className="field-box">{user.email}</div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-main btn-normal" onClick={openEditModal}>
                Actualizar perfil
              </button>
            </div>
          </div>
        </div>
      </Layout>

      {/* Modal de edición de datos de perfil */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <button className="modal-close" onClick={closeEditModal}>
              ×
            </button>
            <h2>
              <span className="vet-name">{userFromLocal["full_name"]}</span>
            </h2>

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
                      <div key={m.id} className="pet-tag">
                        {m.name}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="button-container">
                <button
                  type="submit"
                  className="btn-modal-submit"
                  id="edit-profile-data"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de selección de foto de perfil */}
      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <button className="modal-close" onClick={closePhotoModal}>
              ×
            </button>
            <h2>Selecciona tu foto de perfil</h2>

            <div className="profile-photo-grid">
              {Object.entries(profileImages).map(([pfValue, src]) => (
                <button
                  key={pfValue}
                  type="button"
                  onClick={() => setSelectedPf(Number(pfValue))}
                  className={
                    Number(pfValue) === selectedPf
                      ? "profile-photo-option selected"
                      : "profile-photo-option"
                  }
                >
                  <img src={src} alt={`Perfil ${pfValue}`} />
                </button>
              ))}
            </div>

            <div className="button-container" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={handleSaveProfilePhoto}
              >
                Guardar foto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileVet;
