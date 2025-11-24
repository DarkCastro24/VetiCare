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
  const token = localStorage.getItem("token");
  const userFromLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const API_URL = import.meta.env.VITE_API_URL;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [mascotas, setMascotas] = useState([]);

  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedDui, setEditedDui] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);

  const initialPf = userFromLocal.pf || 2;
  const [currentPf, setCurrentPf] = useState(initialPf);
  const [selectedPf, setSelectedPf] = useState(initialPf);

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => {
    setShowEditModal(false);
    setIsFormDirty(false);
  };

  const openPhotoModal = () => setShowPhotoModal(true);
  const closePhotoModal = () => {
    setSelectedPf(currentPf);
    setShowPhotoModal(false);
  };

  const user = {
    id: userFromLocal["id"],
    nombre: userFromLocal["full_name"],
    email: userFromLocal["email"],
    telefono: userFromLocal["phone"],
    dui: userFromLocal["dui"],
    role: userFromLocal["role_id"] === 2 ? "vet" : "owner",
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
  }, []);

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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isFormDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormDirty]);

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
        setIsFormDirty(false);
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

  const handleSaveProfilePhoto = async () => {
    try {
      // Comprobaciones rápidas (que exista el user.id)
      if (!user?.id) {
        console.error(
          "No hay user.id disponible en localStorage/userFromLocal:",
          user
        );
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "ID de usuario no disponible. Reingresa y vuelve a intentar.",
        });
      }

      // Asegurarnos de que pf sea un número
      const pfValue = Number(selectedPf);
      if (Number.isNaN(pfValue)) {
        console.error("selectedPf no es un número:", selectedPf);
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "La foto seleccionada no es válida.",
        });
      }

      // El JSON que la API debe recibir
      const payload = { pf: pfValue };

      // Imprimir en consola el JSON que enviamos
      console.log("Enviando JSON a la API:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const ct = response.headers.get("content-type") || "";
      let responseBody = null;
      if (ct.includes("application/json")) {
        responseBody = await response.json();
      } else {
        const text = await response.text();
        responseBody = text ? text : null;
      }

      if (!response.ok) {
        const msg =
          (typeof responseBody === "string" && responseBody) ||
          (responseBody && JSON.stringify(responseBody)) ||
          `Error ${response.status}: ${response.statusText}`;
        return Swal.fire({
          icon: "error",
          title: "Error al actualizar foto de perfil",
          text: msg,
        });
      }

      // Actualizar estado y localStorage
      setCurrentPf(pfValue);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, pf: pfValue };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      await Swal.fire({
        icon: "success",
        title: "Foto de perfil actualizada",
      });

      closePhotoModal();
    } catch (error) {
      console.error("Error en handleSaveProfilePhoto:", error);
      await Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error?.message || "No se pudo conectar con el servidor.",
      });
    }
  };

  const currentProfileImage = profileImages[currentPf] || profileImages[2];

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
                  onChange={(e) => {
                    setEditedName(e.target.value);
                    setIsFormDirty(true);
                  }}
                  required
                />
              </div>
              <div className="edit-group horizontal">
                <label>Email</label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => {
                    setEditedEmail(e.target.value);
                    setIsFormDirty(true);
                  }}
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
                  onChange={(e) => {
                    setEditedPhone(e.target.value);
                    setIsFormDirty(true);
                  }}
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
