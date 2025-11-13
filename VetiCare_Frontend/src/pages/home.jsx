import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import '../assets/styles/main.scss';
import Header from './header';
import ServiciosHorarios from './serviciosHorarios';
import SobreNosotros from './sobreNosotros';
import fotoAniHome from '../assets/images/fotoAniHome.png';


const Home = () => {
    return (
        <>
            <div className="body-home">

                <Header />

                <div className="home-titulo pt-2 mt-5">
                    <h1 className="home-texto">¡Amamos a tus mascotas</h1>
                    <h1 className="home-texto">tanto como tú!</h1>
                </div>

                <a className="fotoAniHome" href="#">
                    <img
                        src={fotoAniHome}
                        alt="Foto con animalistos chistosos"
                        width="220"
                        height="auto"
                        className="fotoChivoPets"
                    />
                </a>
            </div>

            <ServiciosHorarios />

            <SobreNosotros />
        </>

    );
};

export default Home;
