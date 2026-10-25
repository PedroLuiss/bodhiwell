
export const PETALS_DATA = [
    {
        id: "petalo-cuerpo",
        dim: "cuerpo",
        transform: "translate(102.2837,299.1343)",
        d: "m 0,0 c -1.239,-0.959 42.203,15.853 95.139,-20.599 4.909,-3.367 0.421,11.995 0.28,17.933 -0.701,29.695 -0.473,66.993 -70.219,88.106 -69.747,21.114 -115.644,3.625 -115.644,3.625 0,0 -18.49,-44.898 2.624,-114.644 21.113,-69.747 59.412,-70.519 89.106,-71.22 9.048,-0.21 35.025,-3.203 27.146,0.748 C -4.816,-79.45 -9.586,-7.856 0,0"
    },
    {
        id: "petalo-mente",
        dim: "mente",
        transform: "translate(199.8071,198.6875)",
        d: "m 0,0 v 0 m 76.247,3.975 c 6.429,-0.304 13,-0.491 19.453,-0.35 29.694,0.701 67.993,1.473 89.106,71.219 21.113,69.746 4.624,114.644 4.624,114.644 0,0 -45.897,17.49 -115.643,-3.624 C 4.04,164.75 2.268,127.452 1.567,97.758 1.356,88.943 1.8,79.895 2.268,71.29 c 0,0 56.77,53.333 98.786,30.302 C 122.332,54.806 76.855,-1.87 76.247,3.975"
    },
    {
        id: "petalo-energia",
        dim: "energia",
        transform: "translate(302.8721,100.416)",
        d: "m 0,0 c -82.887,-22.353 -100.797,39.726 -100.517,31.635 1.006,-29.695 0.748,-95.279 70.496,-116.392 69.746,-21.113 115.643,-3.624 115.643,-3.624 0,0 17.489,45.898 -3.624,115.644 -21.113,69.747 -108.816,73.37 -108.816,73.37 0,0 48.54,-62.428 24.948,-100.446"
    },
    {
        id: "petalo-conciencia",
        dim: "conciencia",
        transform: "translate(131.7207,197.8467)",
        d: "m 0,0 c -9.095,0.537 -18.775,1.028 -28.151,0.817 -29.694,-0.701 -67.993,-1.472 -89.106,-71.218 -21.114,-69.747 -3.624,-115.645 -3.624,-115.645 0,0 45.897,-17.489 115.644,3.624 68.975,20.88 72.225,58.875 72.949,88.429 0.024,0.654 0.071,1.286 0.164,1.917 1.029,6.757 6.874,46.645 -2.385,21.137 -10.1,-27.801 -81.297,-38.744 -95.325,-26.702 -14.053,12.041 1.192,91.772 28.688,96.962"
    }
];

export const INTENT_MAP: Record<string, string[]> = {
    ansiedad: ["ansiedad", "angustia", "nervios", "panico", "pánico", "ataque", "miedo"],
    estres: ["estrés", "estres", "burnout", "agotamiento", "tension", "tensión", "sobrecarga"],
    sueno: ["insomnio", "sueño", "sueno", "dormir", "desvelo", "descanso", "no duermo"],
    dolor: ["dolor", "contractura", "migraña", "espalda", "cuello", "lesión", "lesion"],
    vitalidad: ["cansancio", "fatiga", "baja energia", "baja energía", "sin energia", "vitalidad"],
    proposito: ["propósito", "proposito", "sentido", "rumbo", "vocación", "direccion"]
};

export const INTENT_TO_DIM: Record<string, string> = {
    ansiedad: "mente", estres: "mente", sueno: "mente",
    dolor: "cuerpo", vitalidad: "energia", proposito: "conciencia"
};

export const DIM_KEYWORDS: Record<string, string[]> = {
    cuerpo: ["cuerpo", "fisico", "movimiento", "digest", "piel", "rehabilitacion"],
    mente: ["emocion", "pensamiento", "psico", "autoestima", "duelo"],
    energia: ["vibracion", "reiki", "armon", "energetico"],
    conciencia: ["interior", "evolucion", "presencia", "meditacion"]
};

export const BODHI_INTENTS = [
    { key: "ansiedad", dim: "mente", patterns: ["ansiedad", "angustia", "nervios", "panico", "ataque de miedo"] },
    { key: "insomnio", dim: "mente", patterns: ["insomnio", "no puedo dormir", "sueño liviano", "descanso mal"] },
    { key: "dolor_espalda", dim: "cuerpo", patterns: ["espalda", "lumbalgia", "ciatica", "cuello", "cervical"] },
    { key: "digestivo", dim: "cuerpo", patterns: ["digestion", "hinchazon", "gases", "colon", "acidez"] },
    { key: "baja_energia", dim: "energia", patterns: ["sin energia", "agotado", "cansancio", "fatiga"] },
    { key: "proposito", dim: "conciencia", patterns: ["proposito", "sentido de vida", "crisis existencial"] }
];


export const BODY_PART_TOKENS = new Set([
    "mano","manos","pie","pies","brazo","brazos","pierna","piernas","cabeza","cuello",
    "espalda","pecho","abdomen","panza","estomago","estómago","cara","piel",
    "ojos","oido","oídos","nariz","boca","garganta",
    "hombro","hombros","cadera","rodilla","rodillas","tobillo","tobillos",
    "muñeca","muñecas","codo","codos","dedo","dedos","uña","uñas"
]);


export const BODHI_DATA: any = {
    "conciencia": {
        "key": "conciencia",
        "label": "Conciencia",
        "frase": "Desarrollo interior y expansión de la conciencia.",
        "especialidades": [
            "Meditación",
            "Espiritualidad práctica",
            "Evolución interior",
            "Propósito y sentido de vida",
            "Sabiduría ancestral",
            "Medicina tradicional",
            "Reconexión con la naturaleza",
            "Acompañamiento espiritual",
            "Expansión de la conciencia",
            "Astrología evolutiva",
            "Numerología"
        ]
    },
    "cuerpo": {
        "key": "cuerpo",
        "label": "Cuerpo",
        "frase": "Movimiento, salud física y recuperación del cuerpo.",
        "especialidades": [
            "Medicina general",
            "Medicina familiar",
            "Medicina integrativa",
            "Medicina funcional",
            "Medicina deportiva",
            "Ginecología",
            "Nutrición / Dietética",
            "Fisioterapia / Kinesiología",
            "Rehabilitación física",
            "Osteopatía",
            "Quiropraxia",
            "Acupuntura",
            "Medicina del dolor / Dolor crónico",
            "Sueño y descanso",
            "Ondas de choque",
            "Apiterapia",
            "Fitoterapia / Medicina herbal",
            "Homeopatía",
            "Medicina estética natural"
        ]
    },
    "energia": {
        "key": "energia",
        "label": "Energía",
        "frase": "Vitalidad, armonía y regulación. Descubrí prácticas orientadas a favorecer el equilibrio energético.",
        "especialidades": [
            "Reiki",
            "Biomagnetismo",
            "Bioenergética",
            "Sonido terapéutico",
            "Magnetoterapia",
            "Biorresonancia",
            "Cromoterapia",
            "Cristaloterapia",
            "Frecuencias y vibración",
            "Equilibrio energético",
            "Liberación energética"
        ]
    },
    "mente": {
        "key": "mente",
        "label": "Mente",
        "frase": "Emociones, pensamientos y equilibrio mental.",
        "especialidades": [
            "Psicología",
            "Psicoterapia",
            "Terapia cognitivo-conductual",
            "Estrés y ansiedad",
            "Acompañamiento en duelos",
            "Autoestima",
            "Propósito de vida",
            "Mindfulness",
            "Coaching / Desarrollo personal",
            "PSYCH-K®",
            "Inteligencia emocional",
            "Neurociencia aplicada",
            "Reprogramación de creencias",
            "Terapias transpersonales",
            "Flores de Bach",
            "PNL",
            "Hipnosis",
            "Biodecodificación",
            "Constelaciones familiares"
        ]
    }
};
