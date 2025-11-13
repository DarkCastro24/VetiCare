
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Layout from './layout';
import SearchBox from '../components/search-box';
import { menuItemsVet } from '../config/layout/sidebar';
const API_URL = import.meta.env.VITE_API_URL;

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

const MascotasVet = () => {
  const [mascotas, setMascotas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/pets`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setMascotas(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error al obtener mascotas:', err));
  }, []);

  const calculateAge = birthDateString => {
    if (!birthDateString) return '-';
    const birth = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };



  const mascotasFiltradas = mascotas.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout menuItems={menuItemsVet} userType="vet">
      <h1 className="text-center my-4">Mascotas</h1>
      <div className="d-flex justify-content-center mb-4">
        <SearchBox
          placeholder="Buscar"
          onSearch={term => setSearchTerm(term)}
        />
      </div>

      <section className="petVetView row g-4 px-4" style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        padding: '0 2rem'
      }}>
        {mascotasFiltradas.map(m => {
          const age = calculateAge(m.birth_date);
          return (
            <div key={m.id} className="main-cardPet col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="cardPetVet p-4 rounded-5 text-dark" style={{ backgroundColor: '#c1cfa0' }}>
                <h3 className="fw-bold">{m.name}</h3>
                <p className="mb-1 fs-5"> <strong> Especie: </strong> {m.species?.name || '-'} </p>
                <p className="mb-1 fs-5"> <strong> Raza: </strong> {m.breed || '-'} </p>
                <p className="mb-0 fs-5"> <strong> Edad: </strong> {age !== '-' ? `${age} años` : '-'} </p>
              </div>
            </div>
          );
        })}

        {mascotasFiltradas.length === 0 && (
          <p className="text-center text-muted">No se encontraron mascotas.</p>
        )}
      </section>
    </Layout>
  );
};

export default MascotasVet;
