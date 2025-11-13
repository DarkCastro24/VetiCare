import React, { useState, useEffect } from 'react';


function EditVetForm({ initialData, onSubmit }) {

  const [name, setName] = useState('');
  const [dui, setDui]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);


useEffect(() => {
  if (initialData) {
  
    setName(initialData.full_name);
    setDui(initialData.dui);
    setEmail(initialData.email);
    setPhone(initialData.phone);


  }
}, [initialData]);


  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(initialData);
    const updatedData = {
        ...initialData,
      full_name: name ,           
      dui:dui,
      email: email,            
      phone: phone,

           
     }


    const id = initialData?.id ?? null;

    try{
      await onSubmit(id, updatedData);
    
    }catch(error){
     
      setError("Hubo un problema de formato al guardar los cambios. Revise que cumpla el formato para campo establecido. Nombre: no carácteres especiales, DUI: #########-#, Telefóno ####-####"
      )

    }
    
     
  };

  

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
    

      
      <label htmlFor="name">Nombre completo:</label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
   


      <label htmlFor="dui">Documento único de identidad:</label>
      <input
        type="text"
        id="dui"
        value={dui}
        onChange={(e) => setDui(e.target.value)}
        required
      />
   


      <label htmlFor="email">Correo electrónico:</label>
        <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

    
      <label htmlFor="phone">Telefóno:</label>
        <input
        type="phone"
        id="phonr"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

            
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

   

      <button type="submit" className='edit-submit'>Guardar Cambios</button>
    </form>
  );



 
}

export default EditVetForm;
