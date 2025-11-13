import React from 'react';

export default function PetDetail({ data }) {
  if (!data) return null;

  return (
    <div className="formPetAdmin" >
      <h2>Detalle de Mascota</h2>
      <p><strong>ID:</strong> {data.id}</p>
      <p><strong>Nombre:</strong> {data.name}</p>
      <p><strong>Especie:</strong> {data.species?.name}</p>
      <p><strong>Status:</strong> {data.status}</p>
      <p><strong>Raza:</strong> {data.breed}</p>
      <p><strong>Fecha de Nacimiento:</strong> {new Date(data.birth_date).toLocaleDateString()}</p>
      <p><strong>Dueño:</strong> {data.owner?.full_name}</p>
      <p><strong>DUI:</strong> {data.owner?.dui}</p>
      <p><strong>Teléfono:</strong> {data.owner?.phone}</p>
      
    </div>
  );
}