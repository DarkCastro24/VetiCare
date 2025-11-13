import React from 'react';

function CreatePetForm({ form, setForm, owners, species, onSubmit }) {
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
        <label className="labelPetAdmin">Nombre</label>
        <input
          className="inputPetAdmin"
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="divPetAdminDuenio">
        <label className="labelPetAdmin">Dueño</label>
        <select
          className="inputPetAdmin"
          name="dueño"
          value={form.dueño}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione dueño</option>
          {owners.map(o => (
            <option key={o.id} value={o.id}>
              {o.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="divPetAdminFecha">
        <label className="labelPetAdmin">Fecha de Nacimiento</label>
        <input
          className="inputPetAdmin"
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
      </div>

      <div className="divPetAdminPeso">
        <label className="labelPetAdmin">Peso (kg)</label>
        <input
          className="inputPetAdmin"
          type="number"
          name="peso"
          value={form.peso}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>

      <div className="divPetAdminEspecie">
        <label className="labelPetAdmin">Especie</label>
        <select
          className="inputPetAdmin"
          name="especie"
          value={form.especie}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione especie</option>
          {species.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="divPetAdminRaza">
        <label className="labelPetAdmin">Raza</label>
        <input
          className="inputPetAdmin"
          type="text"
          name="raza"
          value={form.raza}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btnPetAdminCrear">
        Crear Mascota
      </button>
    </form>
  );
}

export default CreatePetForm