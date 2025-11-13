import pencil from '../assets/images/action-button-component/pen-solid.svg'
import x from '../assets/images/action-button-component/xmark-solid.svg'


function ActionComponents({ onEdit, onDelete, elementId }) {


    const handleDelete = () => {
        onDelete(elementId);
    }

    const handleEdit = () => {
        onEdit(elementId);
    }


    return (

        <div id='action-button-container'>
            <div onClick={handleEdit} id="edit-btn" className='action-button'>
                <img src={pencil} alt="edit icon" />
            </div>
            <div onClick={handleDelete} id="delete-btn" className='action-button'>
                <img src={x} alt="delete icon" />
            </div>

        </div>
    )
}

export default ActionComponents