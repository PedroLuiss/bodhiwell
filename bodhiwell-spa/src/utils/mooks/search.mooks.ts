import { Category, ProfessionalsItem, Tag } from "../../types";

export const MOCK_CATEGORIES: Category[] = [
    { uid: 'cat-1', name: 'Cuerpo', slug: 'cuerpo', color_code: '#6c9a78', icon: 'body' },
    { uid: 'cat-2', name: 'Mente', slug: 'mente', color_code: '#4974a5', icon: 'mind' },
    { uid: 'cat-3', name: 'Energía', slug: 'energia', color_code: '#8e62b0', icon: 'energy' },
    { uid: 'cat-4', name: 'Conciencia', slug: 'conciencia', color_code: '#b98c4a', icon: 'consciousness' },
];

export const MOCK_TAGS: Tag[] = [
    { uid: 'tag-1', name: 'Nutrición', slug: 'nutricion', category_uid: 'cat-1' },
    { uid: 'tag-2', name: 'Yoga', slug: 'yoga', category_uid: 'cat-1' },
    { uid: 'tag-3', name: 'Fisioterapia', slug: 'fisioterapia', category_uid: 'cat-1' },
    { uid: 'tag-4', name: 'Psicología', slug: 'psicologia', category_uid: 'cat-2' },
    { uid: 'tag-5', name: 'Mindfulness', slug: 'mindfulness', category_uid: 'cat-2' },
    { uid: 'tag-6', name: 'Reiki', slug: 'reiki', category_uid: 'cat-3' },
    { uid: 'tag-7', name: 'Acupuntura', slug: 'acupuntura', category_uid: 'cat-3' },
    { uid: 'tag-8', name: 'Meditación', slug: 'meditacion', category_uid: 'cat-4' },
    { uid: 'tag-9', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-10', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-11', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-12', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-13', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-14', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-15', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-18', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
    { uid: 'tag-19', name: 'Coaching Espiritual', slug: 'coaching-espiritual', category_uid: 'cat-4' },
];

export const MOCK_PROFESSIONALS: ProfessionalsItem[] = Array.from({ length: 20 }, (_, i) => ({
    uid: `prof-${i + 1}`,
    email: `profesional${i + 1}@example.com`,
    first_name: ['Ana', 'Carlos', 'Elena', 'David', 'Sofia'][i % 5],
    last_name: ['García', 'López', 'Martínez', 'Rodríguez', 'Pérez'][i % 5],
    is_active: true,
    type_account: 'professional',
    main_profession: ['Psicólogo', 'Nutricionista', 'Terapeuta Holístico', 'Coach'][i % 4],
    name: ['Psicólogo Clínico', 'Nutricionista Deportivo', 'Maestro Reiki', 'Life Coach'][i % 4],
    image: null,
    short_description: 'Especialista con más de 10 años de experiencia en terapias integrativas y bienestar holístico.',
    banner_image: '',
    prefix_professional: ['Dra.', 'Lic.', 'Mtro.', ''][i % 4],
}));