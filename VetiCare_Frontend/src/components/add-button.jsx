function AddButton({ onClick, style }) {
  const handleClick = () => {
    onClick()
  }
  return (
    <button type="submit" className='edit-submit' style={style} onClick={handleClick}>Agregar nuevo</button>
  )
}

export default AddButton