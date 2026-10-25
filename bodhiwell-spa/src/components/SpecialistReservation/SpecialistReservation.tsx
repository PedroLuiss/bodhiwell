import React from "react";
import SpecialistSlider from "../SpecialistSlider/SpecialistSlider";
import "./SpecialistReservation.scss";

const SpecialistReservation = () => (
  <section className="specialist-reservation text-center">
    <div className="specialist-reservation__container container">
      <h2 className="specialist-reservation__title">
        Reserva con un especialista hasta 24 horas antes
      </h2>
      
      <p className="specialist-reservation__subtitle">
        Encontrá el mejor camino para tu salud, hora para tu consulta o tu <br />médico integrativo
      </p>

      <button className="btn btn-light specialist-reservation__btn">
        Únete hoy y recibe ayuda
      </button>

      <hr className="my-5" />

      <div className="specialist-reservation__info">
        <p className="specialist-reservation__info-badge m-0">
          Listado de profesionales en Bodhiwell
        </p>

        <h3 className="m-0">
          Un especialista para cada  síntoma
        </h3>

        <p className="specialist-reservation__info-text m-0">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard <br />dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen <br />bookz
        </p>
      </div>

      <SpecialistSlider />
    </div>
  </section>
);

export default SpecialistReservation;
