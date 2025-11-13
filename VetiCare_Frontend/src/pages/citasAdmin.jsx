import Layout from "./layout"
import { menuItemsAdmin } from "../config/layout/sidebar"
import SearchBox from "../components/search-box"
import AdminTable from "./adminTable"
import { useState, useEffect } from "react"
import Modal from "../components/admin-edit-modal"
import EditAppointmentForm from "../components/edit-appointment"

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";


function CitasAdmin() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);




  const adminAppointmentColumns = [
    'id',
    'horario',
    'Mascota',
    'Dueño',
    'Veterinario',
    'Estado',
    'Creado',

  ];



  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  async function getData() {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
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
        "horario":
          item.date.startsWith("0000")
            ? "Sin cita"
            : item.date.toString().concat(" a las: ", item.time),
        Mascota: item.pet.name,
        Dueño: item.pet.owner.full_name,
        Veterinario: item.vet.full_name || "No definido",
        Estado: item.status,
        Creado: item.created_at




      }));

      console.log('Filtered data:', filteredData);
      setAppointments(filteredData);
      setFilteredAppointments(filteredData);
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
    async function getData() {
      try {
        const response = await fetch(`${API_URL}/api/appointments`, {
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
          "horario":
            item.date.startsWith("0000")
              ? "Sin cita"
              : item.date.toString().concat(" a las: ", item.time),
          Mascota: item.pet.name,
          Dueño: item.pet.owner.full_name,
          Veterinario: item.vet.full_name || "No definido",
          Estado: item.status,
          Creado: item.created_at




        }));

        console.log('Filtered data:', filteredData);
        setAppointments(filteredData);
        setFilteredAppointments(filteredData);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo conectar con el servidor.',
        });
      }
    }

    getData();
  }, []);



  const handleSearch = (search) => {
    if (search.trim() === '') {

      setFilteredAppointments(appointments);
    } else {
      const filtered = filteredAppointments.filter((registro) => registro["Dueño"].toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  }



  async function getById(id) {
    try {

      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
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
      console.log('Appointment got:', result);
      return result;
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });

    }
  }


  const handleEdit = async (appointmentId) => {
    try {
      const appointment = await getById(appointmentId);
      setAppointmentToEdit(appointment);
      setModalOpen(true);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
      alert("No se pudo cargar la cita para edición.");
    }
  };


  async function updateAppointment(id, updatedData) {
    try {

      const outdatedData = getById(id);
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...outdatedData, date: updatedData.date, time: updatedData.time, status_id: updatedData.status_id }),
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
      Swal.fire({
              icon: 'success',
              title: 'Cita actualizada',
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


  async function deleteAppointment(id) {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
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
              title: 'Cita eliminada',
              text: 'Cita cancelada con éxito'
            });
      getData();

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo conectar con el servidor.',
      });
    }
  }











  return (
    <Layout userName="Meli lol" menuItems={menuItemsAdmin} userType="admin" >
      <div id="admin-main-container" className="vh-100 overflow-auto pb-5">
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
      }}>Citas</h2>
     
        <SearchBox onSearch={handleSearch} placeholder="Busque cita por dueño" />
        <div className="mb-5">
          <AdminTable rows={filteredAppointments} columns={adminAppointmentColumns} onEdit={handleEdit} onDelete={deleteAppointment} />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <EditAppointmentForm initialData={appointmentToEdit} onSubmit={updateAppointment} />
        </Modal>


      </div>
    </Layout>
  )
}


export default CitasAdmin
