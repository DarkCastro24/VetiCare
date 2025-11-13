import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import gatoIcon from "../assets/images/dotGatoIcon.png";

const SobreNosotros = () => {
  const features = [
    {
      title: 'Servicio Integral',
      description: `Contamos con profesionales capacitados en procesos médicos veterinarios, comprometidos en brindar la mejor
      atención para las mascotas, poniendo a disposición servicios de consulta veterinaria y demás.`,
    },
    {
      title: 'Excelencia',
      description: `Nos comprometemos a ofrecer el más alto nivel de atención veterinaria, utilizando las técnicas más avanzadas
      y manteniéndonos actualizados con las últimas investigaciones y prácticas en medicina veterinaria.`,
    },
    {
      title: 'Puntualidad y compromiso',
      description: `Respetamos tu tiempo y el de tu mascota. Nos esforzamos por brindar atención puntual, eficiente y organizada
      en cada cita y servicio.`,
    },
    {
      title: 'Amor por la vida animal',
      description: `Valoramos profundamente la vida de cada ser que atendemos. Nuestra pasión por los animales guía cada decisión,
      acción y trato dentro y fuera de la clínica.`,
    },
  ];

  return (
    <section id="sobreNosotros" className="container-fluid" style={{ background: '#ede8dc' }}>
      <div className="container py-5">
        <h2 className="text-center display-5 fw-bold mb-4">Sobre nosotros</h2>

        <div className="row align-items-center mb-5">
          <div className="col-12 col-md-auto text-center mb-3 mb-md-0">
            <img src={gatoIcon} alt="Logo de gatito" className="icon-gato" />
          </div>
          <div className="col-12 col-md">
            <p className="lead mb-0 text-justify">
              En VetiCare brindamos servicios de cuidados médicos y estéticos con una nueva visión de empatía y vanguardia,
              complementado por nuestro staff de profesionales altamente capacitados y el mejor equipo tecnológico en estudios
              clínicos e imagenología para brindar precisión en cada diagnóstico y tratamiento personalizado de las mascotas.
            </p>
          </div>
        </div>

        <div className="row gy-4 mb-5">
          {features.map(({ title, description }) => (
            <div key={title} className="col-12 col-md-6 d-flex">
              <div className="me-3 flex-shrink-0">
                <img src={gatoIcon} alt="Logo de gatito" className="icon-gato" />
              </div>
              <div>
                <h3 className="display-7 fw-bold">{title}</h3>
                <p className="lead mb-0 text-justify">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SobreNosotros;
