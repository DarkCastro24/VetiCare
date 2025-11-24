import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import Layout from "./layout";
import { menuItemsOwner } from "../config/layout/sidebar";
import AddButton from "../components/add-button";

const API_URL = import.meta.env.VITE_API_URL;

function CitasOwner() {

  const today = new Date();
today.setHours(0, 0, 0, 0); // evita errores de zona horaria
const localToday = today.toLocaleDateString("en-CA"); // formato YYYY-MM-DD


  // Token del usuario almacenado en localStorage
  const token = localStorage.getItem("token");

  // Usuario autenticado obtenido de localStorage
  const userFromLocal = JSON.parse(localStorage.getItem("user"));

  // Validación de sesión y redirección a login
  if (!userFromLocal || !userFromLocal.id) {
    Swal.fire({
      icon: "error",
      title: "Sesión expirada",
      text: "Por favor inicia sesión nuevamente",
    }).then(() => {
      window.location.href = "/login";
    });
    return null;
  }

  // Objeto de usuario mínimo necesario
  const user = { id: userFromLocal.id };

  // Estados de formulario para crear cita
  const [selectedPetId, setSelectedPetId] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");

  // Listados de mascotas y citas
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Disparador de recarga de citas
  const [appAdded, setAppAdded] = useState(false);

  // Control del modal para crear cita
  const [showEditModal, setShowEditModal] = useState(false);

  // Control del modal de detalles de cita
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  const openDetailsModal = (app) => {
    setDetailsAppointment(app);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsAppointment(null);
  };

  const isFormDirty = selectedPetId || date || hour;

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty]);

  useEffect(() => {
    async function getPets(userId) {
      try {
        const response = await fetch(`${API_URL}/api/pets/owner/${userId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error("Error al obtener mascotas");
          setPets([]);
          return;
        }

        const data = await response.json();

        const safePets = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              name: item.name,
            }))
          : [];

        setPets(safePets);
      } catch (error) {
        console.error("Fetch error (mascotas):", error);
        setPets([]);
      }
    }

    getPets(user.id);
  }, []);

  function mapStatus(statusId) {
    switch (statusId) {
      case 1:
        return "Agendada";
      case 2:
        return "Finalizada";
      case 3:
        return "Cancelada";
      default:
        return "Desconocido";
    }
  }

  function renderStatus(statusId) {
    const label = mapStatus(statusId);
    let icon = "●";
    let bg = "#ccc";

    switch (statusId) {
      case 1:
        icon = "⏰";
        bg = "#f1c40f33";
        break;
      case 2:
        icon = "✔";
        bg = "#2ecc7133";
        break;
      case 3:
        icon = "✖";
        bg = "#e74c3c33";
        break;
      default:
        icon = "●";
        bg = "#95a5a633";
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px",
          borderRadius: "999px",
          fontSize: "0.85rem",
          backgroundColor: bg,
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    );
  }

  function hasValue(v) {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  }

  useEffect(() => {
    async function getData(userId) {
      try {
        const response = await fetch(
          `${API_URL}/api/appointments/user/${userId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          Swal.fire({ icon: "error", title: "Error", text: errorText });
          setAppointments([]);
          return;
        }

        const currentPage = 1;
        const itemsPerPage = 7;
        const data = await response.json();

        const safeAppointments = Array.isArray(data)
          ? data.map((item, i) => {
              const fechaOriginal = item.date || "";
              const esSinCita =
                !fechaOriginal || fechaOriginal.startsWith("0000");

              const fechaFormateada = esSinCita
                ? "Sin fecha"
                : fechaOriginal.replace(/-/g, "/");

              const horaFormateada = esSinCita
                ? "Sin hora"
                : item.time || "Sin hora";

              return {
                id: item.id,
                rowNumber: (currentPage - 1) * itemsPerPage + i + 1,
                petId: item.pet_id,
                rawDate: item.date,
                rawTime: item.time,
                petName: item.pet?.name ?? "Sin nombre",
                vetName: item.vet?.full_name ?? "No asignado",
                speciesName: item.pet?.species?.name ?? "Desconocida",
                dateFormatted: fechaFormateada,
                timeFormatted: horaFormateada,
                statusId: item.status_id,
                statusLabel: mapStatus(item.status_id),
                reason: item.reason,
                weightKg: item.weight_kg,
                temperature: item.temperature,
                medicationsPrescribed: item.medications_prescribed,
                additionalNotes: item.additional_notes,
              };
            })
          : [];

        setAppointments(safeAppointments);

        if (safeAppointments.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin citas registradas",
            text: "Aún no tienes citas en tu historial.",
            confirmButtonText: "Entendido",
          });
        }
      } catch (error) {
        console.error("Error al cargar citas:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar citas",
          text: error.message,
        });
        setAppointments([]);
      }
    }

    getData(user.id);
  }, [appAdded]);

  const handleAddAppointment = async () => {
    if (!selectedPetId || !date || !hour) {
      closeEditModal();
      return Swal.fire({
        icon: "info",
        title: "Campos vacíos",
        text: "Por favor completa todos los campos para crear la cita.",
      });
    }

    const apiDate = formatForAPI(date);

    const sameDateTime = appointments.some(
      (app) => app.rawDate === apiDate && app.rawTime === hour
    );

    if (sameDateTime) {
      closeEditModal();
      return Swal.fire({
        icon: "info",
        title: "Horario no disponible",
        text: "Ya tienes una cita registrada en ese mismo día y a esa misma hora.",
      });
    }

    const petHasPending = appointments.some(
      (app) => app.petId === selectedPetId && app.statusId === 1
    );

    if (petHasPending) {
      closeEditModal();
      return Swal.fire({
        icon: "info",
        title: "Mascota con cita pendiente",
        text: "Esta mascota ya tiene una cita agendada. Finaliza o cancela esa cita antes de crear una nueva.",
      });
    }

    const newAppointment = {
      pet_id: selectedPetId,
      date: apiDate,
      time: hour,
    };

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAppointment),
      });

      if (!response.ok) {
        closeEditModal();
        const errorText = await response.text();
        return Swal.fire({
          icon: "error",
          title: "Error al guardar nueva cita",
          text: errorText,
        });
      }

      Swal.fire({ icon: "success", title: "Cita creada" });
      closeEditModal();
      setAppAdded((p) => !p);
      setSelectedPetId("");
      setDate("");
      setHour("");
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error al crear la cita",
        text: error.message,
      });
    }
  };

  function formatForAPI(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }

  return (
    <>
      <Layout menuItems={menuItemsOwner} userType="vet">
        <div
          id="main-container-appointments"
          style={{
            marginTop: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
              marginBottom: "8px",
            }}
          >
            <p
              id="title"
              style={{
                margin: 0,
                textAlign: "left",
                paddingLeft: "36px",
              }}
            >
              ¡Bienvenido!
            </p>

            <div
              className="search-add-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <p style={{ margin: 0, paddingLeft: "36px" }}>
                Tu historial de citas:
              </p>
              <AddButton
                type="button"
                onClick={openEditModal}
                style={{ backgroundColor: "#a5b68d" }}
              />
            </div>
          </div>

          {/* Tabla principal de historial de citas */}
          <div
            id="table-container"
            style={{ width: "100%", overflowX: "auto" }}
          >
            <table
              className="simple-table"
              style={{
                width: "100%",
                textAlign: "center",
              }}
            >
              <thead>
                {appointments.length !== 0 && (
                  <tr>
                    <th>#</th>
                    <th>Mascota</th>
                    <th>Veterinario</th>
                    <th>Especie</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Detalles</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {appointments.map((app, i) => (
                  <tr key={app.id || i}>
                    <td>{app.rowNumber}</td>
                    <td>{app.petName}</td>
                    <td>{app.vetName}</td>
                    <td>{app.speciesName}</td>
                    <td>{app.dateFormatted}</td>
                    <td>{app.timeFormatted}</td>
                    <td>{renderStatus(app.statusId)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openDetailsModal(app)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                        title="Ver detalles"
                      >
                        🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {appointments.length === 0 && (
              <div>No tienes citas en tu historial.</div>
            )}
          </div>
        </div>
      </Layout>

      {/* Modal para crear una nueva cita */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal-app">
            <button className="modal-close" onClick={closeEditModal}>
              ×
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAppointment();
              }}
            >
              <h2>Crear Cita</h2>

              <div className="edit-group">
                <label>Mascota</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  required
                >
                  <option value="">Seleccione una mascota</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={date}
                  min={localToday}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="edit-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  required
                />
              </div>

              <div className="button-container">
                <button type="submit" id="submit">
                  Crear Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver los detalles de una cita */}
      {showDetailsModal && detailsAppointment && (
        <div className="modal-overlay">
          <div className="edit-modal-app">
            <button className="modal-close" onClick={closeDetailsModal}>
              ×
            </button>

            <h2>Detalles de la cita</h2>

            <div className="details-group">
              <p>
                <strong>Mascota:</strong> {detailsAppointment.petName}
              </p>
              <p>
                <strong>Veterinario:</strong> {detailsAppointment.vetName}
              </p>
              <p>
                <strong>Especie:</strong> {detailsAppointment.speciesName}
              </p>
              <p>
                <strong>Fecha:</strong> {detailsAppointment.dateFormatted}
              </p>
              <p>
                <strong>Hora:</strong> {detailsAppointment.timeFormatted}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {mapStatus(detailsAppointment.statusId)}
              </p>

              {hasValue(detailsAppointment.reason) && (
                <p>
                  <strong>Motivo:</strong> {detailsAppointment.reason}
                </p>
              )}

              {hasValue(detailsAppointment.weightKg) && (
                <p>
                  <strong>Peso:</strong> {detailsAppointment.weightKg} kg
                </p>
              )}

              {hasValue(detailsAppointment.temperature) && (
                <p>
                  <strong>Temperatura:</strong> {detailsAppointment.temperature}{" "}
                  °C
                </p>
              )}

              {hasValue(detailsAppointment.medicationsPrescribed) && (
                <p>
                  <strong>Medicamentos recetados:</strong>{" "}
                  {detailsAppointment.medicationsPrescribed}
                </p>
              )}

              {hasValue(detailsAppointment.additionalNotes) && (
                <p>
                  <strong>Notas adicionales:</strong>{" "}
                  {detailsAppointment.additionalNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CitasOwner;
