export interface NewsItem {
    id: number;
    title: string;
    date: string;
    link: string;
    excerpt: string;
    content: string;
    status: string;
    image: string | boolean;
    author: string;
    category: string;
    subtitle?: string;
}

export const MOCK_NEWS_DATA: NewsItem[] = [
    {
        id: 1,
        title: "Bienestar Integral: Claves para una vida equilibrada",
        date: "Descubre cómo integrar hábitos saludables en tu rutina diaria para mejorar tu bienestar físico y emocional.",
        link: "image",
        excerpt: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
        content: "/blog",
        status: "publish",
        image: "image",
        author: "author",
        category: "Lectura"
    },
    {
        id: 2,
        title: "La importancia de la salud mental en el trabajo",
        date: "Consejos prácticos para manejar el estrés laboral y fomentar un ambiente de trabajo positivo y productivo.",
        link: "image",
        excerpt: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
        content: "/blog",
        status: "publish",
        image: "image",
        author: "author",
        category: "Lectura"
    },
    {
        id: 3,
        title: "Nutrición Consciente: Come mejor, vive mejor",
        date: "Aprende los principios básicos de la alimentación consciente y cómo pueden transformar tu relación con la comida.",
        link: "image",
        excerpt: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
        content: "/blog",
        status: "publish",
        image: "image",
        author: "author",
        category: "Lectura"
    },
    {
        id: 4,
        title: "Nutrición Consciente: Come mejor, vive mejor",
        date: "Aprende los principios básicos de la alimentación consciente y cómo pueden transformar tu relación con la comida.",
        link: "image",
        excerpt: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
        content: "/blog",
        status: "publish",
        image: "image",
        author: "author",
        category: "Lectura"
    }
];