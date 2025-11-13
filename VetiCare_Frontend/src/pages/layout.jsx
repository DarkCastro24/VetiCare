//import React from 'react';
import React, { useState } from 'react';
import HeaderVet from './headerVet';
import Sidebar from './sidebarVet';

const Layout = ({ children, userName, menuItems, userType }) => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggle = () => setSidebarOpen(open => !open);

  let firstName = '';
  if (userType === 'admin') {
    const rawAdmin = localStorage.getItem('admin');
    if (rawAdmin) {
      try {
        const { full_name } = JSON.parse(rawAdmin);
        firstName = full_name.split(' ')[0];
      } catch {
        firstName = '';
      }
    }
  } else {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const { full_name } = JSON.parse(rawUser);
        firstName = full_name.split(' ')[0];
      } catch {
        firstName = '';
      }
    }
  }

  return (
    <div className={`expedientes-app ${userType == "vet" ? 'vet-background' : 'admin-background'}`}>
      <HeaderVet userName={firstName} onToggleSidebar={handleToggle} userType={userType} />

      <div className={`app-body d-flex ${sidebarOpen ? 'sidebar-open' : ''} ${userType == "vet" ? 'vet-background' : 'admin-background'}`}>
        <Sidebar items={menuItems} userType={userType} />
        <main className={`main-content flex-fill ${userType == "vet" ? 'vet-background' : 'admin-background'}`}>

          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;