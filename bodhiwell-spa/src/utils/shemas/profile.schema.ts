import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const profileDetailsSchema = z.object({
    gender: z.string().min(1, "El género es requerido.").optional(),
    country: z.string().min(2, "El país es requerido.").optional(),
    city: z.string().min(2, "La ciudad es requerida.").optional(),
    address: z.string().min(10, "La dirección debe tener al menos 10 caracteres.").optional(),
    language: z.string().min(2, "El idioma es requerido.").optional(),
    phone: z.string().min(10, "El número de teléfono no es válido.").optional(),
    about: z.string().optional(),
    professional_info: z.string().optional(),
    prefix_professional: z.string().optional(),
    short_description: z.string().min(10, "La descripción corta es requerida.").max(100, "Máximo 100 caracteres.").optional(),
    main_profession_uid: z.string().optional(),
    banner_image: z.string().optional(),
    
    consult_time: z.coerce
        .number({ message: "Debe ser un número" })
        .positive("El tiempo de consulta debe ser un número positivo.")
        .int("Debe ser un número entero.").optional(),

    policies: z.boolean().refine(val => val === true, {
        message: "Debes aceptar las políticas para continuar.",
    }).optional(),
    image: z
        .instanceof(File, { message: "Se requiere un archivo de imagen." })
        .optional() 
        .refine(
            (file) => !file || file.size <= MAX_FILE_SIZE, 
            `El tamaño máximo de la imagen es 5MB.`
        )
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Solo se aceptan formatos .jpg, .jpeg, .png y .webp."
        ),
});

export const profileSchema = z.object({
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").optional(),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").optional(),
    email: z.string().email("Debe ser un correo electrónico válido.").optional(),
    details: profileDetailsSchema.optional(),
    studies: z.array(z.object({
        name: z.string(),
        institute: z.string(),
        status: z.string(),
        type: z.string(),
        date_start: z.string(),
        date_end: z.string(),
    })).optional(),
    professions: z.array(z.object({
        name: z.string(),
        status: z.string(),
    })).optional(),
    certificates: z.array(z.object({
        name: z.string(),
        status: z.string(),
        institute: z.string(),
        url_file: z.string(),
    })).optional()
});

export type ProfileFormData = z.infer<typeof profileSchema>;