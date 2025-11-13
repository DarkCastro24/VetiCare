import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logoHeader from '../assets/images/logoHeader.png';
import '../assets/styles/main.scss';
import { Link } from 'react-router-dom';
import SobreNosotros from './sobreNosotros';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="container-header">
            <a className="navbar-brand" href="#">
                <img
                    src={logoHeader}
                    alt="Logo CVetiCare"
                    width="220"
                    height="auto"
                    className="imagenLogoHeader"
                />
            </a>
            <button className="navbar-toggler" onClick={toggleMenu}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
                <ul className="navbar-nav">
                    <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/login">Iniciar sesión</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/register">Registrarse</Link></li>
                    <li className="nav-item"><a className="nav-link" href="#servicios">¿Quiénes somos?</a></li>
                </ul>
            </div>

        </div>
    );
};

export default Header;