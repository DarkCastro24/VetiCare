
import { use, useState } from "react";
import SearchBox from "../components/search-box";
import Table from "../components/table";
import Checkbox from "../components/checkbox";
import { useEffect } from "react";
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

import Layout from './layout';
import { menuItemsOwner } from "../config/layout/sidebar";
import AddButton from "../components/add-button";
import ActionComponents from "../components/action-components";

function MascotasOwner() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const columns = ["#", "Mascota"];
  const [pets, setPets] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedBreed, setEditedBreed] = useState('');
  const [actionWasDone, setActionWasDone] = useState(false);

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);
  const userFromLocal = JSON.parse(localStorage.getItem("user"));
  const user = {
    id: userFromLocal["id"],
  };

  useEffect(() => {
    async function getPets(userId) {
      try {
        const response = await fetch(`${API_URL}/api/pets/owner/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorText,
          });
        }
        const currentPage = 1;
        const itemsPerPage = 7;
        const data = await response.json();
        console.log(data)
        const activePets = data.filter((item) => item.status === "Activa");
        const filteredData = activePets.map((item, index) => ({
          id: item.id,
          rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
          "Mascota": item.name,

        }));
        console.log('Filtered data:', filteredData);
        setPets(filteredData);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar citas',
          text: error.message
        });
      }
    }
    getPets(user.id);
  }, [actionWasDone]);

  async function getById(id) {
    try {
      const response = await fetch(`${API_URL}/api/pets/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorText,
        });
      }
      const result = await response.json();
      console.log('Pet got:', result);
      return result;
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  }

  const handleEdit = async (petId) => {
    try {
      const pet = await getById(petId);
      setSelectedPetId(pet.id);
      setEditedName(pet.name || '');
      setEditedBreed(pet.breed || '');
      setShowEditModal(true);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  const handleUpdatePet = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pets/${selectedPetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: editedName,
          breed: editedBreed
        }),
      });
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Mascota actualizada',
        });
        setActionWasDone(prev => !prev)
        closeEditModal();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.message || 'No se pudo conectar con el servidor.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  };




  async function deletePet(id) {
    try {
      const response = await fetch(`${API_URL}/api/pets/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorText,
        });
      }
      console.log(response.status);
       Swal.fire({
                      icon: 'success',
                      title: 'Mascota desactivada',
                  });
      setActionWasDone(prev => !prev)
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  }
  const col = columns.slice(1, columns.length)
  return (
    <>
      <Layout menuItems={menuItemsOwner} userType="vet">
        <div id="main-container-appointments">
          <div className="search-add-row">
            <p>
              Tus mascotas:
            </p>
            
          </div>
          <div id="table-container">
            <table className="simple-table">
              <thead>
                <tr >
                  {pets.length !== 0 && (
                    columns.map((column) => (
                      <th> {column}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr>
                    <td>
                      {pet["rowNumber"]}
                    </td>
                    {
                      col.map((col) =>
                        (<td>{pet[col]}</td>))}
                    <td>
                      <ActionComponents onEdit={handleEdit} onDelete={deletePet} elementId={pet["id"]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pets.length === 0 && (
              <div>
                No tienes citas en tu historial.
              </div>
            )}
          </div>
        </div>
      </Layout>
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal-app">
            <button className="modal-close" onClick={closeEditModal}>×</button>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePet();
            }}>
              <div className="edit-group">
                <label>Nuevo nombre</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                  placeholder="Ingrese el nuevo nombre"
                />
              </div>
              <div className="edit-group">
                <label>Nueva raza</label>
                <input
                  type="text"
                  value={editedBreed}
                  onChange={(e) => setEditedBreed(e.target.value)}
                  required
                  placeholder="Ingrese la nueva raza"
                />
              </div>
              <div className="button-container">
                <button type="submit" id="submit">Actualizar Mascota</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  )
}


export default MascotasOwner;