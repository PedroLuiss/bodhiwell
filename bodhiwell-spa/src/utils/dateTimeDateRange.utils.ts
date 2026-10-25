import dayjs from 'dayjs';

/**
 * Verifica si una fecha específica (en formato 'YYYY-MM-DD') es anterior al día de hoy.
 * @param date - La fecha a verificar en formato de string 'YYYY-MM-DD'.
 * @returns {boolean} - `true` si la fecha ya pasó, de lo contrario `false`.
 */
export const isPastDate = (date: string): boolean => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/**
 * Verifica si un bloque de tiempo específico en una fecha dada ya ha finalizado.
 * @param date - La fecha del bloque en formato 'YYYY-MM-DD'.
 * @param block - El bloque de tiempo con hora de inicio ('from') y fin ('to').
 * @returns {boolean} - `true` si la hora de finalización del bloque ya pasó.
 */
export const isPastTimeBlock = (date: string, block: { from: string; to: string }): boolean => {
  const blockEndDateTime = dayjs(`${date}T${block.to}`);
  return dayjs().isAfter(blockEndDateTime);
};