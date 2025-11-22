import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import Layout from "./layout";
import { menuItemsOwner } from "../config/layout/sidebar";
import ActionComponents from "../components/action-components";
import { FaPaw, FaNotesMedical } from "react-icons/fa";

function MascotasOwner() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const columns = [
    "#",
    "Nombre",
    "Especie",
    "Raza",
    "Icono",
    "Historial médico",
  ];

  const [pets, setPets] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedBreed, setEditedBreed] = useState("");
  const [actionWasDone, setActionWasDone] = useState(false);

  // Modal agregar mascota
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [speciesId, setSpeciesId] = useState("1");
  const [breed, setBreed] = useState("");

  // Modal historial médico
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPet, setHistoryPet] = useState(null);

  const userFromLocal = JSON.parse(localStorage.getItem("user") || "{}");

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

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  const openAddPetModal = () => setShowAddPetModal(true);
  const closeAddPetModal = () => setShowAddPetModal(false);

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryData([]);
    setHistoryPet(null);
  };

  // CARGAR MASCOTAS
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
          name: item.name,
          speciesName: item.species?.name || "Sin especie",
          breed: item.breed || "Sin raza",
          icon:
            item.species?.name === "Gato"
              ? "🐱"
              : item.species?.name === "Perro"
              ? "🐶"
              : "🐾",
        }));

        setPets(filteredData);
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
  }, [API_URL, token, user.id, actionWasDone]);

  // OBTENER POR ID
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
        text: error.message,
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

  // ELIMINAR CON CONFIRMACIÓN
  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "¿Deseas desactivar esta mascota?",
      text: "Podrás registrarla nuevamente si es necesario.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deletePet(id);
      }
    });
  };

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

  // ABRIR HISTORIAL MÉDICO
  const handleOpenHistory = async (petId) => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setHistoryData([]);
    setHistoryPet(null);

    try {
      const response = await fetch(
        `${API_URL}/api/appointments/pet/${petId}/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setShowHistoryModal(false);
        return Swal.fire({
          icon: "error",
          title: "Error al cargar historial médico",
          text: errorText || "Error en la petición.",
        });
      }

      const data = await response.json();
      const safeArray = Array.isArray(data) ? data : [];
      setHistoryData(safeArray);

      if (safeArray.length > 0) {
        setHistoryPet(safeArray[0].pet);
      }
    } catch (error) {
      setShowHistoryModal(false);
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error.message,
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // AGREGAR NUEVA MASCOTA
  const handleSubmitPet = async (e) => {
    e.preventDefault();

    const parsed = new Date(`${birthDate}T00:00:00Z`)
      .toISOString()
      .replace(".000Z", "Z");

    const payload = {
      owner_id: user.id,
      name: name,
      birth_date: parsed,
      species_id: parseInt(speciesId),
      breed: breed,
    };

    try {
      const response = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        closeAddPetModal();
        setName("");
        setBirthDate("");
        setSpeciesId("1");
        setBreed("");
        setActionWasDone((prev) => !prev);
      } else {
        closeAddPetModal();
        const errorText = await response.text();
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: errorText,
        });
      }
    } catch (err) {
      closeAddPetModal();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo conectar con el servidor.",
      });
    }
  };

  return (
    <>
      <Layout menuItems={menuItemsOwner} userType="vet">
        <div id="main-container-appointments">
          {/* Encabezado*/}
          <div
            className="search-add-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaPaw size={48} style={{ color: "#a5b68d", paddingRight: 10 }} />
              <div>
                <p
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  Mis mascotas
                </p>
                <span
                  style={{
                    fontSize: "18px",
                    color: "#64748b",
                  }}
                >
                  Revisa, agenda y consulta el historial médico de tus
                  compañeros peludos.
                </span>
              </div>
            </div>

            <button
              className="btn-main btn-normal"
              type="button"
              onClick={openAddPetModal}
            >
              Agregar mascota
            </button>
          </div>

          {/* TABLA */}
          <div id="table-container">
            <table className="simple-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  {pets.length !== 0 &&
                    columns.map((column, i) => (
                      <th key={i} style={{ textAlign: "center" }}>
                        {column}
                      </th>
                    ))}
                  {pets.length !== 0 && (
                    <th style={{ textAlign: "center" }}>Acciones</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {pets.map((pet) => (
                  <tr key={pet.id}>
                    <td style={{ textAlign: "center" }}>{pet.rowNumber}</td>
                    <td style={{ textAlign: "center" }}>{pet.name}</td>
                    <td style={{ textAlign: "center" }}>{pet.speciesName}</td>
                    <td style={{ textAlign: "center" }}>{pet.breed}</td>

                    <td style={{ textAlign: "center", fontSize: "28px" }}>
                      {pet.icon}
                    </td>

                    {/* Historial médico */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        title="Ver historial médico"
                        onClick={() => handleOpenHistory(pet.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <FaNotesMedical
                          size={20}
                          style={{ color: "#2563eb" }}
                        />
                      </button>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <ActionComponents
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        elementId={pet.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pets.length === 0 && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "#eef5ff",
                  border: "1px solid #b3d1ff", // 👈 CORREGIDO
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
              <h2>Editar Mascota</h2>
              <div className="edit-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                />
              </div>
              <div className="edit-group">
                <label>Raza</label>
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

      {/* MODAL AGREGAR MASCOTA */}
      {showAddPetModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <button className="modal-close" onClick={closeAddPetModal}>
              ×
            </button>
            <h2>Registrar nueva mascota</h2>
            <form onSubmit={handleSubmitPet}>
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Fecha de nacimiento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />

              <label>Especie</label>
              <select
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
                required
              >
                <option value="1">Perro</option>
                <option value="2">Gato</option>
                <option value="3">Ave</option>
              </select>

              <label>Raza</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                required
                style={{ marginBottom: "25px" }}
              />

              <button
                type="submit"
                className="btn-modal-submit"
                style={{ marginTop: "10px" }}
              >
                Registrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL MÉDICO */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="password-modal" style={{ maxWidth: "700px" }}>
            <button className="modal-close" onClick={closeHistoryModal}>
              ×
            </button>

            <h2 style={{ marginBottom: "10px" }}>
              Historial médico{" "}
              {historyPet ? `de ${historyPet.name?.trim()}` : ""}
            </h2>

            {historyPet && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#f3f4ff",
                  fontSize: "14px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Nombre:</strong> {historyPet.name}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Especie:</strong> {historyPet.species?.name || "N/D"}{" "}
                  · <strong>Raza:</strong> {historyPet.breed || "N/D"}
                </p>
              </div>
            )}

            {historyLoading && (
              <div style={{ textAlign: "center", padding: "15px" }}>
                Cargando historial...
              </div>
            )}

            {!historyLoading && historyData.length === 0 && (
              <div style={{ textAlign: "center", padding: "15px" }}>
                Esta mascota aún no tiene historial médico registrado.
              </div>
            )}

            {!historyLoading && historyData.length > 0 && (
              <div
                className="history-cards"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxHeight: "420px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {historyData.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      padding: "12px 14px",
                      backgroundColor: "#ffffff",
                      boxShadow:
                        "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.08)",
                      fontSize: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        Fecha de la cita: {app.date} a las {app.time} hrs
                      </span>

                      <span
                        style={{
                          fontSize: "12px",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          backgroundColor:
                            app.status === "Finalizada" ? "#dcfce7" : "#fef9c3",
                          color:
                            app.status === "Finalizada" ? "#166534" : "#854d0e",
                          fontWeight: 600,
                        }}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 4px" }}>
                      <strong>Motivo:</strong> {app.reason || "N/D"}
                    </p>

                    <p style={{ margin: "0 0 4px" }}>
                      <strong>Veterinario:</strong>{" "}
                      {app.vet?.full_name || "N/D"}
                    </p>

                    <p style={{ margin: "0 0 4px" }}>
                      <strong>Peso:</strong> {app.weight_kg ?? "N/D"} kg ·{" "}
                      <strong>Temperatura:</strong> {app.temperature ?? "N/D"}{" "}
                      °C
                    </p>

                    <p style={{ margin: "0 0 4px" }}>
                      <strong>Medicamentos:</strong>{" "}
                      {app.medications_prescribed || "N/D"}
                    </p>

                    <p style={{ margin: 0 }}>
                      <strong>Notas:</strong>{" "}
                      {app.additional_notes || "Sin notas adicionales."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MascotasOwner;
