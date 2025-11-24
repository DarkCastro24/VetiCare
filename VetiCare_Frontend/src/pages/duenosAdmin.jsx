import Layout from "./layout"
import { menuItemsAdmin } from "../config/layout/sidebar"
import SearchBox from "../components/search-box"
import AdminTable from "./adminTable"
import { useState, useEffect } from "react"
import Modal from "../components/admin-edit-modal"
import EditAppointmentForm from "../components/edit-appointment"
import EditDuenoForm from "../components/edit-duenos"
import AddButton from "../components/add-button"
import AddOwnerForm from "../components/add-admin-owner-form"

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

function DuenosAdmin() {


  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [ownerToEdit, setOwnerToEdit] = useState(null);
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // SweetAlert arriba
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .swal2-container, .swal2-popup {
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);


  const adminOwnerColumns = [
    , "DUI", "Nombre Completo", "Teléfono", "Correo Electrónico", "Estado"

  ];

  // functions
  async function getData() {
    let index = 0;
    const currentPage = 1;
    const itemsPerPage = 7;
    try {
      //const response = await fetch(`${API_URL}/api/users/owners`, {
      const response = await fetch(`${API_URL}/api/users`, {
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

      const ownersOnly = data.filter(u => u.role_id === 1);

      //Cuando no hay dueños por mostrar
      if (ownersOnly.length === 0) {
        await Swal.fire({
          icon: "info",
          title: "Sin dueños registrados",
          text: "No se encontró ningún dueño registrado en el sistema.",
        });

        setOwners([]);
        setFilteredOwners([]);
        return;
      }

      const filteredData = ownersOnly.map((item) => ({
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
        icon: 'info',
        title: 'Sin dueños',
        text: 'No encuentra ningun usuario registrado',
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

  function handleCreate() {
    //setIsCreating(true);
    setOwnerToEdit(null);
    setModalOpen(true);
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
        text:'No se pudo conectar con el servidor.',
      });
    }
  };

  async function deleteOwner(id) {
    try {

      const owner = await getById(id);
      const currentStatus = owner.status_id;
      const newStatus = currentStatus === 1 ? 2 : 1;

      const actionText = newStatus === 2 ? "desactivar" : "activar";
      const actionTextPast = newStatus === 2 ? "desactivado" : "activado";

      const confirm = await Swal.fire({
        icon: "warning",
        title: `¿Desea ${actionText} este usuario?`,
        text: `El usuario será ${actionTextPast}. Esta acción es reversible.`,
        showCancelButton: true,
        confirmButtonColor: "rgba(161, 19, 19, 1)",
        cancelButtonColor: "#374f59",
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;


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
          text: 'No se pudo conectar con el servidor.',
        });
      }
      console.log(response.status);
      console.log('Appointment deleted successfully');
      getData();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo conectar con el servidor.',
      });
    }
  }

  function mensajeErrorForm(errorText) {
    errorText = errorText.toLowerCase();

    if (errorText.includes("duplicate") || errorText.includes("already in use")) {
      return "El correo o DUI ingresado ya están en uso.";
    }

    if (errorText.includes("duiformat")) {
      return "El DUI ingresado no tiene el formato correcto, por favor agregar guion. Ejemplo: 12345678-9";
    }

    if (errorText.includes("email")) {
      return "Correo electrónico ingresado no es válido";
    }

    if (errorText.includes("phone") || errorText.includes("telefono")) {
      return "El teléfono debe tener el formato ####-####, incluyendo el guion.";
    }

    if (errorText.includes("full_name") || errorText.includes("name")) {
      return "El nombre no puede contener caracteres especiales ni estar vacío.";
    }

    return "Ocurrió un error al procesar la solicitud. Verifique los datos ingresados.";
  }


  async function updateOwner(id, updatedData) {
    if (id == null) {
      //     console.log("updateOwner called with id:", id);

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
            text: [errorText],
          });
        }
        const result = await response.json();
        //console.log('Owner added:', result);
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
          const rawError = await response.text();
          const friendlyMessage = mensajeErrorForm(rawError);

          Swal.fire({
            icon: "error",
            title: "Error al actualizar",
            text: friendlyMessage,
            confirmButtonText: "Entendido"
          });

          return;
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

  async function addOwner(newOwner) {
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: newOwner.full_name,
          dui: newOwner.dui,
          phone: newOwner.phone,
          email: newOwner.email,
          password_hash: newOwner.password_hash,
          role_id: 1,
          status_id: 1
        }),
      });

      if (!response.ok) {
        const rawError = await response.text();
        Swal.fire({
          icon: "error",
          title: "No se pudo crear el dueño",
          text: rawError,
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Dueño creado",
        text: "Registro completado con éxito",
        timer: 3500,
        showConfirmButton: true
      });

      getData();
      setModalOpen(false);

    } catch (error) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
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
          <SearchBox onSearch={handleSearch} placeholder="Búsqueda por nombre" />
          <AddButton onClick={handleCreate} />
        </div>
        <AdminTable rows={filteredOwners} columns={adminOwnerColumns} onEdit={handleEdit} onDelete={deleteOwner} />
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          {ownerToEdit ? (
            <EditDuenoForm initialData={ownerToEdit} onSubmit={updateOwner} />
          ) : (
            <AddOwnerForm onSubmit={addOwner} />
          )}
        </Modal>

      </div>
    </Layout>
  )
}

export default DuenosAdmin;