import React from 'react';

function UpdateAdminForm({ form, setForm, onSubmit }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="formPetAdmin" onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
        <div className="divPetAdminNombre">
        <label>Nombre</label>
        <input
          className="inputPetAdmin"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="divPetAdminNombre">
        <label>Username</label>
        <input
          className="inputPetAdmin"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="divPetAdminNombre">
        <label>Teléfono</label>
        <input
          className="inputPetAdmin"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div className="divPetAdminNombre">
        <label>Email</label>
        <input
          className="inputPetAdmin"
          type="email"
          name="email"
          value={form.email}
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
      <button type="submit" className="btnPetAdminCrear">Actualizar</button>
    </form>
  );
}

export default UpdateAdminForm
