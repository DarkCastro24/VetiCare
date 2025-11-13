import { NavLink } from 'react-router-dom';
import React from 'react';

function SidebarVet({ items, activePath, userType }) {

  const admin_type_id = localStorage.getItem('admin_type_id');


  return (
    <nav className={`sidebar-menu d-flex flex-column p-3 ${userType === 'vet' ? 'vet-sidebar' : 'admin-sidebar'}`}>
      <ul className="nav flex-column h-100">
        {items.map(item => (
          <li className="nav-item mb-2" key={item.name}>
            <NavLink
              to={item.href}
              className="nav-link"
              activeClassName="active"
            >
              {item.name}
            </NavLink>
          </li>
        ))}

        {userType === "admin" && admin_type_id === "1" && (
          <li id='superadmin-item'>
            <NavLink
              to="/superadmin/administradores"
              className="nav-link"
              activeClassName="active"
            >
              Gerentes
            </NavLink>
          </li>
        )}


      </ul>
    </nav>
  );
}

export default SidebarVet;
