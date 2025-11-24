import Layout from "./layout"
import { menuItemsAdmin } from "../config/layout/sidebar"
import SearchBox from "../components/search-box"
import AdminTable from "./adminTable"
import { useState, useEffect } from "react"
import Modal from "../components/admin-edit-modal"
import EditVetForm from "../components/edit-veterinarians"
import AddButton from "../components/add-button"
import CreateVetForm from "../components/add-admin-vet-form"

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";


function VeterinariansAdmin() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setModalOpen] = useState(false);
  const [veterinarianToEdit, setVeterinarianToEdit] = useState(null);
  const [isCreating, setIsCreating] = useState(false);





  const admminVeterinarianColumns = ["Nombre completo", "DUI", "Teléfono", "Correo", "Estado"];



  const [vets, setVets] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);

  async function getData() {
    try {
      const response = await fetch(`${API_URL}/api/users/vets`, {
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



      let index = 0;
      const currentPage = 1;
      const itemsPerPage = 7;
      const data = await response.json();

      console.log(data)
      const filteredData = data.map((item) => ({




        rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
        id: item.id,
        "DUI": item.dui,
        "Nombre completo": item.full_name,
        Correo: item.email,
        Teléfono: item.phone,
        Estado: item.status_id == 1 ? "Activo" : "Desactivado",





      }));

      console.log('Filtered data:', filteredData);
      setVets(filteredData);
      setFilteredVets(filteredData);
    } catch (error) {
      await Swal.fire({
        icon: 'info',
        title: 'Sin veterinarios',
        text: 'No encuentra ningún veterinario registrado',
      });
    }
  }


  useEffect(() => {
    //needs to be changed
    getData();
  }, []);



  const handleSearch = (search) => {
    if (search.trim() === '') {

      setFilteredVets(vets);
    } else {
      const filtered = filteredVets.filter((registro) => registro["Nombre completo"].toLowerCase().includes(search.toLowerCase())
      );
      setFilteredVets(filtered);
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
      console.log('Veterinarian got:', result);
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
    setIsCreating(true);
    setVeterinarianToEdit(null);
    setModalOpen(true);
  }


  const handleEdit = async (vetId) => {
    setIsCreating(false);
    if (!vetId) {
      setVeterinarianToEdit(null);
      setModalOpen(true);
      return;
    }

    try {
      const vet = await getById(vetId);
      setVeterinarianToEdit(vet);
      setModalOpen(true);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo conectar con el servidor.',
      });
    }
  };

  useEffect(() => {
    // Modal con error siempre se muestra encima de otros elementos
    const style = document.createElement('style');
    style.textContent = `
    .swal2-container {
      z-index: 10000 !important;
    }
  `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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





  async function updateVeterinarian(id, updatedData) {
    if (id == null) {
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
            role_id: 2


          }),
        });



        if (!response.ok) {
          const errorText = await response.json();
          //console.error(`Error ${response.status}:`, errorText);
          //alert(`Error al agregar nuevo veterinario: ${errorText}`);
          throw new Error(`Error ${response.status}: Failed to add new veterinarian`);
        }


        const result = await response.json();
        //console.log('Veterinarian added:', result);
        setModalOpen(false);
        getData();

      } catch (error) {
        //console.error('Add error:', error);
        throw error;
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
          body: JSON.stringify({ ...outdatedData, full_name: updatedData.full_name, dui: updatedData.dui, email: updatedData.email, phone: updatedData.phone }),
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
          title: 'Veterinario actualizado',
          text: 'Los cambios se guardaron con éxito',
          timer: 1800,
          showConfirmButton: false
        });

        console.log('Veterinarian updated:', result);
        setModalOpen(false);
        getData();
      } catch (error) {
        console.error('Update error:', error);
        throw error;
      }


    }
  }


  async function deleteVeterinarian(id) {
    try {

      // Pregunta antes de eliminar
      const confirm = await Swal.fire({
        icon: "warning",
        title: "¿Está seguro?",
        text: "Esta acción no se puede revertir. El veterinario será eliminado permanentemente.",
        showCancelButton: true,
        confirmButtonColor: "rgba(161, 19, 19, 1)",
        cancelButtonColor: "#374f59",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      //Se cancela la acción así que no pasa nada
      if (!confirm.isConfirmed) {
        return;
      }

      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }


      console.log(response.status, 'Appointment deleted successfully');
      getData();

    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  async function createVet(newVet) {
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: newVet.full_name,
          dui: newVet.dui,
          phone: newVet.phone,
          email: newVet.email,
          password_hash: newVet.password_hash,
          role_id: 2,
          status_id: 1
        }),
      });

      if (!response.ok) {
        const rawError = await response.text();
       const friendlyMessage = mensajeErrorForm(rawError);

      Swal.fire({
        icon: "error",
        title: "Error al crear usuario",
        text: friendlyMessage, // ← Ahora mostrará el mensaje específico
        confirmButtonText: "Entendido"
      });
      return;
      }

      Swal.fire({
        icon: "success",
        title: "Veterinario creado",
        text: "El registro se completó con éxito",
        timer: 5500,
        showConfirmButton: true,
      });

      getData();   // Actualiza tabla
      setModalOpen(false);

    } catch (error) {
      console.error("Create Vet Error:", error);
      Swal.fire({
      icon: "error",
      title: "Error al ingresar datos",
      text: error.message, 
    });
    }
  }










  return (
    <Layout userName="Alison lol" menuItems={menuItemsAdmin} userType="admin">
      
      <div id="admin-main-container">
        <h2 className="records-header__title mb-0 me-3" style={{
                    height: '3rem',
                    color: '#374f59',
                    margin: '1rem 9rem 1rem 2rem',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '3rem',
                    fontWeight: 600,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>Veterinarios</h2>
        
        <div className="search-add-row">
          <SearchBox onSearch={handleSearch} placeholder="Búsqueda por nombre" />
          <AddButton onClick={handleCreate} />
        </div>
        <AdminTable rows={filteredVets} columns={admminVeterinarianColumns} onEdit={handleEdit} onDelete={deleteVeterinarian} />


        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          {isCreating ? (
            <CreateVetForm onSubmit={createVet} />
          ) : (
            <EditVetForm initialData={veterinarianToEdit} onSubmit={updateVeterinarian} />
          )}
        </Modal>



      </div>
    </Layout>
  )
}


export default VeterinariansAdmin
