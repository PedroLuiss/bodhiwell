// import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./SpecialistSlider.scss";
import specialistImg from "../../assets/images/SpecialistSlider/doctor.png";

const specialists = [
    {
        name: "Juan Pérez",
        specialty: "ENDOCRINÓLOGO",
        img: specialistImg
    },
    {
        name: "Juan Pérez",
        specialty: "ENDOCRINÓLOGO",
        img: specialistImg,
    },
    {
        name: "Juan Pérez",
        specialty: "ENDOCRINÓLOGO",
        img: specialistImg,
    },
    {
        name: "Juan Pérez",
        specialty: "ENDOCRINÓLOGO",
        img: specialistImg,
    },
    {
        name: "Juan Pérez",
        specialty: "ENDOCRINÓLOGO",
        img: specialistImg,
    },
    {
        name: "Juan Pérez",
        specialty: "ENDOCRINÓLOGO",
        img: specialistImg,
    },
];

const SpecialistSlider = () => (
    <div className="specialist-slider">
        <Swiper
            slidesPerView={4}
            spaceBetween={30}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="specialist-slider__carousel"
            breakpoints={{
                0: { slidesPerView: 1 },
                480: { slidesPerView: 2 },
                900: { slidesPerView: 4 },
            }}
        >
            {specialists.map((item, idx) => (
                <SwiperSlide key={idx}>
                    <div className="specialist-slider__card card">
                        <img
                            className="specialist-slider__img card-img-top"
                            src={item.img}
                            alt={item.name}
                        />
                        <div className="card-body text-start">
                            <div className="specialist-slider__name">{item.name}</div>
                            <div className="specialist-slider__specialty">{item.specialty}</div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    </div>
);

export default SpecialistSlider;