
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

/**
 * Vista principal encargada de mostrar las citas activas del día actual.
 * Permite buscar citas por nombre del dueño y marca de asistencia.
 */


function Dayappoint() {
  const placeholder = "Buscar por nombre del dueño";
  // Token de autenticación obtenido desde localStorage
  const token = localStorage.getItem("token");


    // Columnas visibles en la tabla
  const columns = ["#", "DUI", "Nombre Completo", "Telefóno", "Horario"];

  /**
   * Obtención y formato de la fecha actual en DD-MM-YYYY.
   */
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

  // Estado global de citas
  const [appointments, setAppointments] = useState([]);

   // Estado filtrado utilizado por la tabla
  const [filteredAppointments, setFilteredAppointments] = useState([]);


  /**
   * useEffect — carga inicial de citas del día.
   * Llama al endpoint /api/appointments/active y valida múltiples casos:
   *   - Respuesta no válida
   *   - Arreglo vacío
   *   - Error de conexión
   */
  useEffect(() => {
  async function getData() {
    try {
      const response = await fetch(`${API_URL}/api/appointments/active?date=${today}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

           // Manejo de error HTTP
      if (!response.ok) {
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cargar las citas.',
        });
      }

      const data = await response.json();
      console.log("Respuesta API:", data);

          // Caso: no hay citas
      if (!Array.isArray(data) || data.length === 0) {
        setAppointments([]);
        setFilteredAppointments([]);

        return Swal.fire({
          icon: 'info',
          title: 'Sin citas',
          text: 'No hay citas programadas para el día de hoy.',
        });
      }

      let index = 0;
      const currentPage = 1;
      const itemsPerPage = 7;

      /**
         * Transformación de datos recibidos desde la API
         * para integrarlos de forma amigable en la tabla del frontend.
         */

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
        Asistencia: item.status_id == 2 ? "Sí" : "No",
      }));

      setAppointments(filteredData);
      setFilteredAppointments(filteredData);
    } catch (error) {
      // Error de conexión u otro error inesperado
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar citas',
        text: 'Hubo un problema con la conexión al servidor.',
      });
    }
  }

  getData();
}, []);


  const col = columns.slice(1, columns.length)

  /**
   * handleSearch
   * ------------
   * Filtra las citas por nombre del dueño.
   * Ignora mayúsculas/minúsculas.
   */
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