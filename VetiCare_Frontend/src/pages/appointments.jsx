
import { useState } from "react";
import SearchBox from "../components/search-box";
import Table from "../components/table";
import Checkbox from "../components/checkbox";
import { useEffect } from "react";
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

import Layout from './layout';

import { menuItemsVet } from "../config/layout/sidebar";
const API_URL = import.meta.env.VITE_API_URL;
function Dayappoint() {
  const placeholder = "Buscar por nombre del dueño";
  const token = localStorage.getItem("token");

  const columns = ["#", "DUI", "Nombre Completo", "Telefóno", "Horario"];

  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let today = "";
  if (month < 10) {
    today = `${day}-0${month}-${year}`;
  } else {
    today = `${day}-${month}-${year}`;
  }

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch(`${API_URL}/api/appointments/active?date=${today}`, {
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
          id: item.id,
          rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
          DUI: item.pet.owner.dui,
          "Nombre Completo": item.pet.owner.full_name,
          Telefóno: item.pet.owner.phone,

          "Horario":
            item.date.startsWith("0000")
              ? "Sin cita"
              : item.date.toString().concat(" a las: ", item.time),
          Asistencia: item.status_id == 2 ? 'Si' : 'No',
        }));
        console.log('Filtered data:', filteredData);
        setAppointments(filteredData);
        setFilteredAppointments(filteredData);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar citas',
          text: error.message
        });
      }
    }
    getData();
  }, []);

  const col = columns.slice(1, columns.length)
  const handleSearch = (search) => {
    if (search.trim() === '') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = filteredAppointments.filter((registro) => registro["Nombre Completo"].toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  }
  return (
    <>
      <Layout menuItems={menuItemsVet} userType="vet">
        <div id="main-container-appointments">
          <p id="title">
            ¡Bienvenido!
          </p>
          <div id="search-box-container">
            <p>
              Citas del día:
            </p>
            <SearchBox onSearch={handleSearch} placeholder={placeholder} />
          </div>
          <div id="table-container">
            <table className="simple-table">
              <thead>
                <tr >
                  {filteredAppointments.length !== 0 && (
                    columns.map((column) => (
                      <th> {column}</th>
                    ))
                  )}
                  {filteredAppointments.length !== 0 && (
                    <th>
                      Asistencia
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((filteredAppointment) => (
                  <tr>
                    <td>
                      {filteredAppointment["rowNumber"]}
                    </td>
                    {
                      col.map((col) =>
                        (<td>{filteredAppointment[col]}</td>))}
                    <td id="extra-row">
                      {
                        filteredAppointments.length != 0 && (
                          filteredAppointment["Asistencia"] == "Sí" ? <Checkbox initialValue={true} appointmentId={filteredAppointment["id"]} /> : <Checkbox initialValue={false} appointmentId={filteredAppointment["id"]} />)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAppointments.length === 0 && (
              <div>
                No se encontraron registros a ese nombre.
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}


export default Dayappoint;