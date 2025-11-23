import React, { useState } from "react";

function AddOwnerForm({ onSubmit }) {

    // form para crear veterinario desde la vista de admin
  const [fullName, setFullName] = useState("");
  const [dui, setDui] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newOwner = {
      full_name: fullName,
      dui: dui,
      phone: phone,
      email: email,
      password_hash: password,
      role_id: 1,
      status_id: 1
    };

    try {
      await onSubmit(newOwner);
    } catch (err) {
      setError("Ocurrió un error al crear el dueño de mascota");
    }
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>

      <h2 className="mb-3">Registro de dueño</h2>

     <label htmlFor="name">Nombre completo:</label>
      <input type="text" 
      id="name" value={fullName} 
      onChange={e => setFullName(e.target.value)} 
      required />

      <label>DUI:</label>
      <input type="text" 
      value={dui} 
      onChange={e => setDui(e.target.value)} 
      required />

      <label>Teléfono:</label>
      <input type="text" 
      value={phone} 
      onChange={e => setPhone(e.target.value)} 
      required />

      <label>Correo electrónico:</label>
      <input type="email" 
      value={email} onChange={e => setEmail(e.target.value)} 
      required />

      <label>Contraseña:</label>
      <input type="password" 
      value={password} 
      onChange={e => setPassword(e.target.value)} 
      required />

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="edit-submit">Crear dueño</button>

    </form>


  );
}

export default AddOwnerForm;
