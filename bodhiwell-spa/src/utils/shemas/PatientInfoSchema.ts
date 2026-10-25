import { z } from 'zod';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const patientInfoSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "El formato del correo electrónico no es válido." }).min(1, { message: "El correo es requerido." }),
  number: z.string()
    .min(1, { message: "El número de teléfono es requerido." })
    .refine((val) => {
      const digitsOnly = val.replace(/[^0-9]/g, '');
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }, {
      message: "Por favor, introduce un número de teléfono válido (entre 7 y 15 dígitos)."
    }),
  photo: z
    .instanceof(File, { message: "Se requiere un archivo." })
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `El tamaño máximo del archivo es de 25MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Solo se permiten formatos .jpg, .jpeg, .png y .webp."
    ),
  reserveReason: z.string().min(10, 'El motivo de la consulta debe tener al menos 10 caracteres.'),
  quoteForInvited: z.boolean(),
});