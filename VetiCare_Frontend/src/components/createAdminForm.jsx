import React from 'react';

function CreateAdminForm({ form, setForm, adminTypes, onSubmit, onCancel }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="formPetAdmin" onSubmit={e => {
      e.preventDefault(); onSubmit({
        ...form,
        admin_type_id: Number(form.admin_type_id)
      });
    }}>
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
        <label>DUI</label>
        <input
          className="inputPetAdmin"
          name="dui"
          value={form.dui}
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
      <div className="divPetAdminNombre">
        <label>Tipo de Admin</label>
        <select
          className="inputPetAdmin"
          name="admin_type_id"
          value={form.admin_type_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione tipo</option>
          {adminTypes.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btnPetAdminCrear">Crear</button>
    </form>
  );
}

export default CreateAdminForm
