import Layout from "./layout"
import { menuItemsAdmin } from "../config/layout/sidebar"
import SearchBox from "../components/search-box"
import AdminTable from "./adminTable"
import { useState, useEffect } from "react"
import Modal from "../components/admin-edit-modal"
import EditVetForm from "../components/edit-veterinarians"
import AddButton from "../components/add-button"

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";


function VeterinariansAdmin() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setModalOpen] = useState(false);
  const [veterinarianToEdit, setVeterinarianToEdit] = useState(null);




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
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
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


  const handleEdit = async (vetId) => {
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
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  };


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
          console.error(`Error ${response.status}:`, errorText);
          alert(`Error al agregar nuevo veterinario: ${errorText}`);
          throw new Error(`Error ${response.status}: Failed to add new veterinarian`);
        }


        const result = await response.json();
        console.log('Veterinarian added:', result);
        setModalOpen(false);
        getData();

      } catch (error) {
        console.error('Add error:', error);
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
          throw new Error(`Error ${response.status}: Failed to update appointment`);
        }


        const result = await response.json();
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









  return (
    <Layout userName="Alison lol" menuItems={menuItemsAdmin} userType="admin">
      <div id="admin-main-container">
        <div className="search-add-row">
          <SearchBox onSearch={handleSearch} placeholder="Busque por nombre" />
          <AddButton onClick={handleEdit} />
        </div>
        <AdminTable rows={filteredVets} columns={admminVeterinarianColumns} onEdit={handleEdit} onDelete={deleteVeterinarian} />


        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <EditVetForm initialData={veterinarianToEdit} onSubmit={updateVeterinarian} />


        </Modal>


      </div>
    </Layout>
  )
}


export default VeterinariansAdmin
