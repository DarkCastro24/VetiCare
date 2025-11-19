import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import Layout from "./layout";
import { menuItemsOwner } from "../config/layout/sidebar";
import ActionComponents from "../components/action-components";

function MascotasOwner() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const columns = ["#", "Mascota"];
  const [pets, setPets] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedBreed, setEditedBreed] = useState("");
  const [actionWasDone, setActionWasDone] = useState(false);

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  // VALIDAR USER LOCALSTORAGE
  const userFromLocal = JSON.parse(localStorage.getItem("user"));

  if (!userFromLocal || !userFromLocal.id) {
    Swal.fire({
      icon: "info",
      title: "Sesión expirada",
      text: "Inicia sesión nuevamente.",
    }).then(() => {
      window.location.href = "/login";
    });
    return null;
  }

  const user = { id: userFromLocal.id };

  // GET PETS
  useEffect(() => {
    async function getPets(userId) {
      try {
        const response = await fetch(`${API_URL}/api/pets/owner/${userId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return Swal.fire({
            icon: "error",
            title: "Error al obtener mascotas",
            text: errorText,
          });
        }

        const data = await response.json();

        const safeData = Array.isArray(data) ? data : [];

        const activePets = safeData.filter((item) => item.status === "Activa");

        const currentPage = 1;
        const itemsPerPage = 7;

        const filteredData = activePets.map((item, index) => ({
          id: item.id,
          rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
          Mascota: item.name,
        }));

        setPets(filteredData);

        if (filteredData.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin mascotas registradas",
            text: "Aún no has registrado ninguna mascota.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: error.message,
        });
        setPets([]);
      }
    }

    getPets(user.id);
  }, [actionWasDone]);

  // OBTENER MASCOTA POR ID
  async function getById(id) {
    try {
      const response = await fetch(`${API_URL}/api/pets/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: errorText,
        });
      }

      return await response.json();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al conectar con el servidor.",
      });
    }
  }

  // EDITAR MASCOTA
  const handleEdit = async (petId) => {
    try {
      const pet = await getById(petId);

      setSelectedPetId(pet.id);
      setEditedName(pet.name || "");
      setEditedBreed(pet.breed || "");

      setShowEditModal(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // ACTUALIZAR MASCOTA
  const handleUpdatePet = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pets/${selectedPetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedName,
          breed: editedBreed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.message || "Error al actualizar.",
        });
      }

      Swal.fire({
        icon: "success",
        title: "Mascota actualizada",
      });

      setActionWasDone((prev) => !prev);
      closeEditModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error.message,
      });
    }
  };

  // ELIMINAR
  async function deletePet(id) {
    try {
      const response = await fetch(`${API_URL}/api/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: errorText,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Mascota desactivada",
      });

      setActionWasDone((prev) => !prev);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error.message,
      });
    }
  }

  const col = columns.slice(1);

  return (
    <>
      <Layout menuItems={menuItemsOwner} userType="vet">
        <div id="main-container-appointments">
          <div className="search-add-row">
            <p>Tus mascotas:</p>
          </div>

          <div id="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  {pets.length !== 0 &&
                    columns.map((column, i) => <th key={i}>{column}</th>)}
                  {pets.length !== 0 && <th>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {pets.map((pet, idx) => (
                  <tr key={idx}>
                    <td>{pet.rowNumber}</td>

                    {col.map((c, j) => (
                      <td key={j}>{pet[c]}</td>
                    ))}

                    <td>
                      <ActionComponents
                        onEdit={handleEdit}
                        onDelete={deletePet}
                        elementId={pet.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* MENSAJE VISUAL EN PANTALLA */}
            {pets.length === 0 && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "#eef5ff",
                  border: "1px solid #b3d1ff",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#1d4ed8",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontSize: "16px",
                }}
              >
                <i
                  className="fa-regular fa-circle-info"
                  style={{ fontSize: "20px" }}
                ></i>
                No tienes mascotas registradas.
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal-app">
            <button className="modal-close" onClick={closeEditModal}>
              ×
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePet();
              }}
            >
              <div className="edit-group">
                <label>Nuevo nombre</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                />
              </div>

              <div className="edit-group">
                <label>Nueva raza</label>
                <input
                  type="text"
                  value={editedBreed}
                  onChange={(e) => setEditedBreed(e.target.value)}
                  required
                />
              </div>

              <div className="button-container">
                <button type="submit" id="submit">
                  Actualizar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MascotasOwner;
