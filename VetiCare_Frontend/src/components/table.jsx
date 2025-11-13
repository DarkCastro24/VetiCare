import { useState } from "react"



function Table({rows, columns}){
    
    
return (

    <div className= "table-wrapper">
        <table className="simple-table">
        <thead>
          <tr >
      

            { rows.length !== 0 &&(
                columns.map((column) => (
                    <th> {column}</th>
                ))
            
            )  }
           
          </tr>
        </thead>

        <tbody>
       
        {rows.map((row) => (
         <tr>
        {columns.map((column) => 
        (<td>{row[column]}</td>))}

        </tr>
        ))}
         


        </tbody>

            </table>

            
          {rows.length === 0 && (
            
              <div>
                No se encontraron registros a ese nombre.
              </div>
           
          )}
    </div>
)
}

export default Table;