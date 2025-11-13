// src/pages/CitasOwner.jsx
import React, { useState, useEffect } from "react";
import SearchBox from "../components/search-box";
import Table from "../components/table";
import Checkbox from "../components/checkbox";
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

import Layout from './layout';
import { menuItemsOwner } from "../config/layout/sidebar";
import AddButton from "../components/add-button";

const API_URL = import.meta.env.VITE_API_URL;

function CitasOwner() {
    const token = localStorage.getItem("token");
    const columns = ["#", "Mascota", "Horario", "Asistencia"];
    const [selectedPetId, setSelectedPetId] = useState("");
    const [date, setDate] = useState("");
    const [hour, setHour] = useState("");
    const [pets, setPets] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [appAdded, setAppAdded] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const openEditModal = () => setShowEditModal(true);
    const closeEditModal = () => setShowEditModal(false);
    const userFromLocal = JSON.parse(localStorage.getItem("user"));
    const user = { id: userFromLocal.id };

    useEffect(() => {
        async function getPets(userId) {
            try {
                const response = await fetch(`${API_URL}/api/pets/owner/${userId}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setPets(data.map(item => ({ id: item.id, name: item.name })));
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
        getPets(user.id);
    }, []);

    useEffect(() => {
        async function getData(userId) {
            try {
                const response = await fetch(`${API_URL}/api/appointments/user/${userId}`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    return Swal.fire({ icon: 'error', title: 'Error', text: errorText });
                }
                const currentPage = 1, itemsPerPage = 7;
                const data = await response.json();
                const filtered = data.map((item, i) => ({
                    id: item.id,
                    rowNumber: (currentPage - 1) * itemsPerPage + i + 1,
                    Mascota: item.pet.name,
                    Horario: item.date.startsWith("0000")
                        ? "Sin cita"
                        : `${item.date} a las: ${item.time}`,
                    Asistencia: item.status_id == 2 ? 'Si' : 'No',
                }));
                setAppointments(filtered);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error al cargar citas', text: error.message });
            }
        }
        getData(user.id);
    }, [appAdded]);

    const handleAddAppointment = async () => {
        if (!selectedPetId || !date || !hour) {
            return Swal.fire({
                icon: 'error',
                title: 'Campos vacíos',
                text: "Por favor completa todos los campos"
            });
        }
        const newAppointment = {
            pet_id: selectedPetId,
            date: formatForAPI(date),
            time: hour
        };
        try {
            const response = await fetch(`${API_URL}/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newAppointment),
            });
            if (!response.ok) {
                closeEditModal();
                const errorText = await response.text();
                return Swal.fire({ icon: 'error', title: 'Error al guardar nueva cita', text: errorText });
            }
            Swal.fire({ icon: 'success', title: 'Cita creada' });
            closeEditModal();
            setAppAdded(p => !p);
            setSelectedPetId("");
            setDate("");
            setHour("");
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error al crear la cita', text: error.message });
        }
    };

    function formatForAPI(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    }

    const col = columns.slice(1);

    return (
        <>
            <Layout menuItems={menuItemsOwner} userType="vet">
                <div id="main-container-appointments" >
                    <p id="title">¡Bienvenido!</p>
                    <div className="search-add-row">
                        <p>Tu historial de citas:</p>
                        <AddButton
                            type="button"
                            onClick={openEditModal}
                            style={{ backgroundColor: '#a5b68d' }}
                        />
                    </div>
                    
                    <div id="table-container" style={{ width: '100%', overflowX: 'auto' }}>

                        <table className="simple-table" >
                            <thead>
                                <tr>
                                    {appointments.length !== 0 && columns.map((col, i) => <th key={i}>{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((app, i) => (
                                    <tr key={i}>
                                        <td>{app.rowNumber}</td>
                                        {col.map((c, j) => <td key={j}>{app[c]}</td>)}
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

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="edit-modal-app">
                        <button className="modal-close" onClick={closeEditModal}>×</button>
                        <form onSubmit={e => { e.preventDefault(); handleAddAppointment(); }}>
                            <h2>Crear Cita</h2>
                            <div className="edit-group">
                                <label>Mascota</label>
                                <select
                                    value={selectedPetId}
                                    onChange={e => setSelectedPetId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione una mascota</option>
                                    {pets.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="edit-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="edit-group">
                                <label>Hora</label>
                                <input
                                    type="time"
                                    value={hour}
                                    onChange={e => setHour(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="button-container">
                                <button type="submit" id="submit">Crear Cita</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default CitasOwner;
