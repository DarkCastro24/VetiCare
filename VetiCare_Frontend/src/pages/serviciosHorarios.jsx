import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/main.scss";
import GroomingIcon from "../assets/images/groomingIcon.png";
import UltrasonidoIcon from "../assets/images/ultrasonoLogo.png";
import EcoIcon from "../assets/images/ecocardioIcon.png";
import RayosXIcon from "../assets/images/rayosXIcon.png";
import PetshopIcon from "../assets/images/petshopIcon.png";

const ServiciosHorarios = () => {
  const servicios = [
    { title: "Grooming", icon: GroomingIcon },
    { title: "Ultrasonografía", icon: UltrasonidoIcon },
    { title: "Ecocardiograma", icon: EcoIcon },
    { title: "Rayos X", icon: RayosXIcon },
    { title: "Petshop", icon: PetshopIcon },
  ];

  return (
    <section id="servicios" className="serviHora container-fluid py-5">
      <h2 className="serviHoraTitulo fw-bold mb-4 display-5 text-center">
        Nuestros servicios
      </h2>

      <div
        className="servicios d-grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))"
        }}
      >
        {servicios.map(({ title, icon }) => (
          <div
            key={title}
            className="serviHora__services-item text-center"
          >
            <div className="serviHora__services-item__icon mb-2">
              <img src={icon} alt={title} className="img-fluid" />
            </div>
            <p className="serviHora__services-item__label mb-0">
              {title}
            </p>
          </div>
        ))}
      </div>

      <h2 className="serviHora__schedule__title fw-bold mt-5 mb-4 display-5 text-center">
        Horarios de atención
      </h2>
      <div className="horarioBox d-flex justify-content-center">
        <div className="serviHora__schedule__box">
          <dl className="serviHora__schedule__list mb-0 p-3">
            <dt className="fs-4">Lunes a viernes:</dt>
            <dd className="fs-4">8:00 A.M. – 4:00 P.M.</dd>
            <dt className="fs-4">Sábado:</dt>
            <dd className="fs-4">7:00 A.M. – 1:00 P.M.</dd>
            <dt className="fs-4">Domingo:</dt>
            <dd className="fs-4">Cerrado</dd>
          </dl>
        </div>
      </div>

    </section>
  );
};

export default ServiciosHorarios;
