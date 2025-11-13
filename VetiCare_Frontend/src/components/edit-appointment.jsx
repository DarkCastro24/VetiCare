import React, { useState, useEffect } from 'react';


function EditAppointmentForm({ initialData, onSubmit }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [statusId, setStatusId] = useState(1);

useEffect(() => {
  if (initialData) {
    const formatted = formatForInput(initialData.date); 
    setDate(formatted); 
    setTime(formatTimeForInput(initialData.time));
    setStatusId(initialData.status_id);
  }
}, [initialData]);


  const handleSubmit = async(e) => {
    e.preventDefault();


    console.log(initialData);
      const updatedData = {
        ...initialData,
      date: formatForAPI(date) ,           
      time: time,            
      status_id: Number(statusId),

           
     }

    onSubmit(initialData.id, updatedData);
    
     
  };

  
 function formatForInput(dateStr) {
    const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`; 
  }

  function formatTimeForInput(timeStr) {
    return timeStr.replace('.', ':');
  }

   function formatForAPI(dateStr) {
    const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`; 
  }


  return (
    <form className="edit-form" onSubmit={handleSubmit}>
  


      
      <label htmlFor="date">Fecha:</label>
      <input
        type="date"
        id="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
  


      <label htmlFor="time">Hora:</label>
      <input
        type="time"
        id="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />


      <label htmlFor="status">Estado:</label>
      <select
        id="status"
        value={statusId}
        onChange={(e) => setStatusId(Number(e.target.value))}
      >
        <option value={1}>Agendada</option>
        <option value={2}>Finalizada</option>
        <option value={3}>Cancelada</option>
      </select>
      

   

      <button type="submit" className='edit-submit'>Guardar Cambios</button>
    </form>
  );



 




}

export default EditAppointmentForm;
