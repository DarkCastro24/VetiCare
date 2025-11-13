import React from 'react';

function CambiarContra({ form, setForm,onSubmit}) {
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form
      className="formPetAdmin"
      onSubmit={e => { e.preventDefault(); onSubmit(form); }}
    >
      <div className="divPetAdminNombre">
        <label className="labelPetAdmin">Contraseña actual</label>
        <input
          className="inputPetAdmin"
          type="text"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="divPetAdminFecha">
        <label className="labelPetAdmin">Nueva contraseña</label>
        <input
          className="inputPetAdmin"
          type="text"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btnPetAdminCrear">
        Actualizar
      </button>
    </form>
  );
}

export default CambiarContra