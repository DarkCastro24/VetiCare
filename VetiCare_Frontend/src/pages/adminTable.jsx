import ActionComponents from "../components/action-components";

function AdminTable({ rows, columns, onEdit, onDelete, hideEdit = false }) {




    let index = 0;
    const currentPage = 1;
    const itemsPerPage = 7;
    const newRows = rows.map((item, index) => ({
        ...item,
        rowNumber: (currentPage - 1) * itemsPerPage + index + 1
    }));






    return (

        <div className="table-wrapper">
            <table className="simple-table admin-table" >
                <thead>


                    <tr >


                        {newRows.length !== 0 && (
                            <th>
                                #
                            </th>
                        )}

                        {newRows.length !== 0 && (
                            columns.map((column) => (
                                <th> {column}</th>
                            ))

                        )}



                        {newRows.length !== 0 && (
                            <th>
                                Acciones
                            </th>
                        )}


                    </tr>
                </thead>

                <tbody>




                    {newRows.map((newRow) => (
                        <tr>

                            {newRows.length !== 0 && (
                                <th>
                                    {newRow["rowNumber"]}
                                </th>
                            )}

                            {columns.map((column) =>
                                (<td>{newRow[column]}</td>))}





                            {newRows.length !== 0 && (
                                <td id="action-buttons">
                                    <ActionComponents onDelete={onDelete} onEdit={onEdit} elementId={newRow["id"]}  hideEdit={hideEdit}  />
                                </td>
                            )}

                        </tr>
                    ))}



                </tbody>

            </table>


            {newRows.length === 0 && (

                <div>
                    No se encontraron registros a ese nombre.
                </div>

            )}
        </div>
    )
}

export default AdminTable