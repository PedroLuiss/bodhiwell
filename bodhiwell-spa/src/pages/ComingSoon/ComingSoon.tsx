import React from 'react';
import style from './ComingSoon.module.scss';

import Logo from '../../assets/images/ComingSoon/Logo1.png';

const ComingSoon = () => {
  return (
    <div className={style.comingSoon}>
      <div className={style.comingSoon__content}>
        <img className={style.comingSoon__Img} src={Logo} alt="Logo" />
        <p className={style.comingSoon__description}>Muy pronto, Bodhiwell. <br />
          Un punto de encuentro entre la medicina convencional, tradicional y complementaria. <br />
          Una comunidad donde cada profesional y cada consultante aportan, crecen y <br />
          transforman su bienestar.
          </p>
      </div>
    </div>

  );
};

export default ComingSoon;