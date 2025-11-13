import { useEffect, useState } from "react"
import check from "../assets/images/checkbox-component/check.png"

function Checkbox({ initialValue, appointmentId }) {
  const token = localStorage.getItem("token"); 
     const API_URL = import.meta.env.VITE_API_URL;

  const [asistance, setAsistance] = useState(initialValue);


  // todo: 
  /*
  1: agendada
  2: cancelada
  3:finalizada
  
  
  
  (initialValueisPassed/false) => 
    check {
    if(initialValue == false){
    fetch-post (localhost/updatestate
  
    ) else{
     updateState(
    agendada
    
     )
    
    
    }
  
    
    }
  
  } 
  
  */
  async function updateState(asistance, id) {
    if (asistance == true) {

      try {
        const response = await fetch(`${API_URL}/api/appointments/${id}/status/1`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
        throw new Error("Failed to update state");
      }
      const result = await response.json();
      console.log("Server response:", result);


      } catch (error) {
        console.log(error);
      }


    } else {

      try {
        const response = await fetch(`${API_URL}/api/appointments/${id}/status/2`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
          
        }

        const result = await response.json();
      console.log("Server response:", result);
      } catch (error) {
        console.log(error)
      }

    }

  }

  const handleClick = () => {
   


    updateState(asistance, appointmentId
);
    setAsistance(prev => !prev);
   
   




  }

  useEffect(() => {
    console.log('from useEffect...', asistance)
  })


  return (
    <div className="check-box" onClick={handleClick} id={asistance == true ? "true-box" : "false-box"}>
      {asistance == true &&
        <img src={check} alt="" />}



    </div>
  )
}


export default Checkbox