

export const normalize = (str: string) =>
    String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const tokenize = (q: string) => {
    const n = normalize(q);
    if (!n) return [];
    return n.split(" ").filter(t => t.length > 2);
};

export const isSafari = () => {
    const ua = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(ua);
};


export const normalizeTight = (str: string) => normalize(str).replace(/[\s-]/g, "");

