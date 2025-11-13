import Layout from "./layout"
import { menuItemsAdmin } from "../config/layout/sidebar"
import SearchBox from "../components/search-box"
import AdminTable from "./adminTable"
import { useState, useEffect } from "react"
import Modal from "../components/admin-edit-modal"
import EditAppointmentForm from "../components/edit-appointment"
import EditDuenoForm from "../components/edit-duenos"
import AddButton from "../components/add-button"

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

function DuenosAdmin() {


  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setModalOpen] = useState(false);
  const [ownerToEdit, setOwnerToEdit] = useState(null);
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [error, setError] = useState(null);


  const adminOwnerColumns = [
    , "DUI", "Nombre Completo", "Teléfono", "Correo Electrónico", "Estado"

  ];

  // functions
  async function getData() {
    let index = 0;
    const currentPage = 1;
    const itemsPerPage = 7;
    try {
      const response = await fetch(`${API_URL}/api/users/owners`, {
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
      const data = await response.json();
      console.log(data)
      const filteredData = data.map((item) => ({
        id: item.id,
        rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
        DUI: item.dui,
        "Nombre Completo": item.full_name,
        Teléfono: item.phone,
        "Correo Electrónico": item.email,
        Estado: item.status_id == 1 ? "Activo" : "Desactivado",
      }));
      console.log('Filtered data:', filteredData);
      setOwners(filteredData);
      setFilteredOwners(filteredData);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const handleSearch = (search) => {
    if (search.trim() === '') {
      setFilteredOwners(owners);
    } else {
      const filtered = filteredOwners.filter((registro) => registro["Nombre Completo"].toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOwners(filtered);
    }
  }

  async function getById(id) {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
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
      console.log('Owner got:', result);
      return result;
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  }

  const handleEdit = async (ownerId) => {
    if (!ownerId) {
      setOwnerToEdit(null);
      setModalOpen(true);
      return;
    }
    try {
      const owner = await getById(ownerId);
      setOwnerToEdit(owner);
      setModalOpen(true);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  };

  async function deleteOwner(id) {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
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
      console.log('Appointment deleted successfully');
      getData();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  }

  async function updateOwner(id, updatedData) {
    if (id == null) {
      console.log("updateOwner called with id:", id);

      try {
        const response = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({

            full_name: updatedData.full_name,
            dui: updatedData.dui,
            email: updatedData.email,
            phone: updatedData.phone,
            role_id: 1


          }),
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
        console.log('Owner added:', result);
        setModalOpen(false);
        getData();
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo conectar con el servidor.',
        });
      }
    } else {
      try {

        const outdatedData = getById(id);
        const response = await fetch(`${API_URL}/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...outdatedData,
            full_name: updatedData.full_name,
            dui: updatedData.dui,
            email: updatedData.email,
            phone: updatedData.phone


          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error ${response.status}:`, errorText);
          const parsedError= errorText.match(/failed on the '([^']+)' tag/);
          alert(`Error al agregar nuevo dueño: ${parsedError}`);
          throw new Error(`Error ${response.status}: Failed to update appointment`);
        }
        const result = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'Información actualizada con éxito'
        });
        setModalOpen(false);
        getData();
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo conectar con el servidor.',
        });
      }
    }
  }





  return (
    <Layout userName="Alison lol" menuItems={menuItemsAdmin} userType="admin">
      <div id="admin-main-container">
        <h2 className="records-header__title mb-0 me-3" style={{
          //backgroundColor: '#374f59',
          height: '3rem',
          width: '400px',
          color: '#374f59',
          //padding: arriba derecha abajo izquierda;
          //padding: '1rem 1rem 2rem 3rem',
          //margin: '1rem 1.2rem 0.5rem 5rem',
          margin: '1rem 9rem 0.5rem 1rem',
          border: 'none',
          borderRadius: '50px',
          fontSize: '3rem',
          fontWeight: 600,
          alignItems: 'center',
          justifyContent: 'center',
        }}>Dueños</h2>
        <div className="search-add-row">
          <SearchBox onSearch={handleSearch} placeholder="Busque dueño por nombre" />
          <AddButton onClick={handleEdit} />
        </div>
        <AdminTable rows={filteredOwners} columns={adminOwnerColumns} onEdit={handleEdit} onDelete={deleteOwner}/>
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <EditDuenoForm initialData={ownerToEdit} onSubmit={updateOwner} />
        </Modal>
      </div>
    </Layout>
  )
}

export default DuenosAdmin;