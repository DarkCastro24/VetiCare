import React from 'react';

function UpdatePetForm({ form, setForm, onSubmit }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="formPetAdmin" onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <div className="divPetAdminNombre">
        <label className="labelPetAdmin">Nombre</label>
        <input
          type="text"
          name="name"
          value={form.name ?? ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="divPetAdminDuenio">
        <label className="labelPetAdmin">Raza</label>
        <input
          type="text"
          name="breed"
          value={form.breed ?? ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="divPetAdminFecha">
        <label className="labelPetAdmin">Status</label>
        <select
          className="inputPetAdmin"
          name="status_id"
          value={form.status_id ?? ''}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione status</option>
          <option value="1">Activo</option>
          <option value="2">Inactivo</option>
        </select>
      </div>
      <button type="submit" className="btnPetAdminCrear">Actualizar Mascota</button>
    </form>
  );
}

export default UpdatePetForm
