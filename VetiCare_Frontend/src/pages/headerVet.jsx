import React, { useState } from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import logoHeader from '../assets/images/logoHeaderWhite.png';
import CambiarContra from '../components/cambiarContra';
import "bootstrap/dist/css/bootstrap.min.css";
import '../assets/styles/main.scss';

// Imports de fotos de perfil predefinidas
import pf2 from '../assets/images/profile_photos/2.png';
import pf3 from '../assets/images/profile_photos/3.png';
import pf4 from '../assets/images/profile_photos/4.png';
import pf5 from '../assets/images/profile_photos/5.png';
import pf6 from '../assets/images/profile_photos/6.png';
import pf7 from '../assets/images/profile_photos/7.png';
import pf8 from '../assets/images/profile_photos/8.png';

const pfMap = {
  2: pf2,
  3: pf3,
  4: pf4,
  5: pf5,
  6: pf6,
  7: pf7,
  8: pf8,
};

const API_URL = import.meta.env.VITE_API_URL;
const SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET;

const HeaderVet = ({ userName = 'Usuario', onToggleSidebar, userType }) => {
  const token = localStorage.getItem('token');

  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [showOptions, setShowOptions]           = useState(false);
  const [showCambioContra, setShowCambioContra] = useState(false);
  const [form, setForm]                         = useState({ password: '', newPassword: '' });
  const [loading, setLoading]                   = useState(false);

  const navigate = useNavigate();

  const handleAvatarClick   = () => setShowOptions(o => !o);
  const handleLogoutConfirm = () => {
    setShowOptions(false);
    setShowLogoutModal(true);
  };
  const handleLogout = () => {
    localStorage.clear();
    const loginRoute = userType === 'admin' ? '/admin/login' : '/';
    navigate(loginRoute, { replace: true });
  };

  // Obtener foto de perfil desde localStorage
  const getPfValue = () => {
    try {
      const userStr  = localStorage.getItem('user');
      const adminStr = localStorage.getItem('admin');
      const sessionStr = userStr || adminStr;

      if (sessionStr) {
        const sessionObj = JSON.parse(sessionStr);
        const pf = sessionObj?.pf;
        const parsed = parseInt(pf, 10);
        if (!Number.isNaN(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo pf de localStorage:', e);
    }
    return 2; // default
  };

  const pfValue = getPfValue();
  const profileAvatarSrc = pfMap[pfValue] || pf2;

  // CAMBIO DE CONTRASEÑA
  const handlePasswordSubmit = async (formData) => {
    setLoading(true);
    try {
      const isAdminRoute = localStorage.getItem('admin_type_id') !== null;

      const storageKey = isAdminRoute ? 'admin' : 'user';
      const sessionStr = localStorage.getItem(storageKey);
      if (!sessionStr) throw new Error('No se encontró la sesión en localStorage.');
      const sessionObj = JSON.parse(sessionStr);

      const email = sessionObj.email;
      if (!email) throw new Error('No se encontró el correo del usuario.');

      const endpoint = isAdminRoute
        ? `${API_URL}/api/admins/change_password`
        : `${API_URL}/api/users/change_password`;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json'
      };
      if (isAdminRoute) {
        headers['X-Admin-Secret'] = SECRET_KEY;
      }

      const payload = {
        email,
        current_password: formData.password,
        new_password:     formData.newPassword
      };

      const resp = await fetch(endpoint, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload)
      });

      const text = await resp.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; }
      catch { data = { message: text || 'Error desconocido' }; }

      if (!resp.ok) throw new Error(data.message || 'Error al cambiar la contraseña');

      await Swal.fire({
        icon:  'success',
        title: '¡Listo!',
        text:  'Contraseña cambiada exitosamente.'
      });

      setShowCambioContra(false);
      setForm({ password: '', newPassword: '' });
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      await Swal.fire({
        icon:  'error',
        title: 'Oops...',
        text:  err.message || 'No se pudo procesar la solicitud.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header
        className={`app-header d-flex align-items-center justify-content-between px-4 ${
          userType === 'vet' ? 'vet-header' : 'admin-header'
        }`}
      >
        <button
          className="menu-toggle d-md-none"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          <FaBars size={24} />
        </button>

        {/* Logo de la aplicación */}
        <img
          src={logoHeader}
          alt="Logo VetiCare"
          width="200"
          className="imagenLogoHeader"
        />

        {/* Sección de usuario */}
        <div className="app-header__user d-flex align-items-center position-relative">
          <span className="app-header__username">{userName}</span>

          {profileAvatarSrc ? (
            <img
              src={profileAvatarSrc}
              alt="Foto de perfil"
              className="header-user-avatar cursor-pointer"
              onClick={handleAvatarClick}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                marginLeft: '8px',
                cursor: 'pointer'
              }}
            />
          ) : (
            <FaUserCircle
              size={28}
              className="cursor-pointer"
              onClick={handleAvatarClick}
            />
          )}

          {/* Modal cambiar contraseña */}
          <Modal
            show={showCambioContra}
            onHide={() => setShowCambioContra(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Cambiar contraseña</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <CambiarContra
                form={form}
                setForm={setForm}
                onSubmit={handlePasswordSubmit}
              />
            </Modal.Body>
          </Modal>

          {/* Modal cerrar sesión */}
          <Modal
            show={showLogoutModal}
            onHide={() => setShowLogoutModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Cerrar sesión</Modal.Title>
            </Modal.Header>
            <Modal.Body>¿Estás seguro que deseas cerrar sesión?</Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Menú de opciones */}
          {showOptions && (
            <div
              className="list-group position-absolute end-0 mt-2"
              style={{ zIndex: 1000, top: '100%' }}
            >
              <button
                className="list-group-item list-group-item-action"
                onClick={() => setShowCambioContra(true)}
              >
                Cambiar contraseña
              </button>
              <button
                className="list-group-item list-group-item-action"
                onClick={handleLogoutConfirm}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default HeaderVet;
