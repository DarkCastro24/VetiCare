import React from 'react';

function DetailAdminInfo({ data }) {
  if (!data) return null;

  return (
    <div className="formPetAdmin" >
      <h2>Detalle de Administrador</h2>
      <p><strong>ID:</strong> {data.id}</p>
      <p><strong>Nombre:</strong> {data.full_name}</p>
      <p><strong>Username:</strong> {data.username}</p>
      <p><strong>DUI:</strong> {data.dui}</p>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Teléfono:</strong> {data.phone}</p>
      <p><strong>Estado:</strong> {data.status_id === 1 ? 'Activo' : 'Inactivo'}</p>
      <p><strong>Tipo:</strong> {data.admin_type?.name}</p>
    </div>
  );
}

export default DetailAdminInfo