import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'

import "./assets/styles/main.scss";
import Home from './pages/home';
import MascotasVet from './pages/mascotasVet';
import Expediente from './pages/expedienteVet';
import Login from './pages/login';
import Register from './pages/register';
import Dayappoint from './pages/appointments';

import CitasAdmin from './pages/citasAdmin';
import VeterinariansAdmin from './pages/veterinariosAdmin';
import AdminPet from './pages/adminPet';
import ProfileVet from './pages/profileVet';


import EditModal from './components/admin-edit-modal';
import DuenosAdmin from './pages/duenosAdmin';


import LoginAdmin from './pages/loginAdmin';
import RootAddAdmin from './pages/rootAddAdmin';

import RouteProtectedUser from './utils/routeProtectedUser';
import RouteProtectedAdmin from './utils/routeProtectedAdmin';

import Dashboard from './pages/dashboard';
import CitasOwner from './pages/citasOwner';
import MascotasOwner from './pages/mascotasOwner';

function App() {
  return (

    <Router>
      <Routes>

        {/* las generales para todos */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={< LoginAdmin />} />

        {/* Para dueños */}
        <Route element={<RouteProtectedUser allowedRoles={[1]} />}>
          <Route path="/profile" element={< ProfileVet />} />
          <Route path="/mis_citas" element={< CitasOwner />} />
          <Route path="/mis_mascotas" element={< MascotasOwner />} />
        </Route>

        {/* Para veterinarios */}
        <Route element={<RouteProtectedUser allowedRoles={[2]} />}>
          <Route path="/citas" element={<Dayappoint />} />
          <Route path="/expediente" element={<Expediente />} />
          <Route path="/mascotas" element={<MascotasVet />} />
        </Route>


        {/* Para admins*/}
        <Route element={<RouteProtectedAdmin allowedAdminTypes={[1, 2]} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/citas" element={<CitasAdmin />} />
          <Route path="/admin/veterinarios" element={<VeterinariansAdmin />} />
          <Route path="/admin/duenos" element={<DuenosAdmin />} />
          <Route path="/admin/mascotas" element={<AdminPet />} />
        </Route>


        {/* PSolo para root */}
        <Route element={<RouteProtectedAdmin allowedAdminTypes={[1]} />}>
          <Route path="/superadmin/administradores" element={<RootAddAdmin />} />
        </Route>



      </Routes>
    </Router>
  );

}


export default App
