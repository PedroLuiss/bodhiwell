import { JSX } from "react";
import { CalendarCheckIcon, CheckIcon, GiftIcon, SearchDocumentIcon } from "../../components/icons";

export type IStep = {
  icon: JSX.Element;
  title: string;
  description: string;
}

export const stepsData: IStep[] = [
  {
    icon: <CheckIcon width={20} height={20} />,
    title: 'REGISTRATE GRATIS',
    description: 'Accedé a los perfiles de profesionales, agendas disponibles y contenido personalizado. Solo necesitás tus datos reales para crear tu cuenta.'
  },
  {
    icon: <SearchDocumentIcon width={20} height={20} />,
    title: 'EXPLORÁ Y ELEGÍ',
    description: 'Buscá por especialidad, enfoque o necesidad. Leé los perfiles, revisá disponibilidad y encontrá a quien resuene con vos.'
  },
  {
    icon: <GiftIcon width={20} height={20} />,
    title: 'ELEGÍ TU PLAN CUANDO QUIERAS',
    description: 'Podés mantenerte en el plan gratuito o elegir un plan con más beneficios (Premium o Familiar). Cada uno te da distintas herramientas, accesos y descuentos para'
  },
  {
    icon: <CalendarCheckIcon width={20} height={20} />,
    title: 'RESERVÁ TU CONSULTA',
    description: 'Desde la misma plataforma agendás la consulta con el profesional elegido. Hay opciones online y presenciales, según el perfil de cada uno.'
  }
];
