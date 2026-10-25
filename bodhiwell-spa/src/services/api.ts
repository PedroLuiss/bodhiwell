const API_URL = "https://api.ejemplo.com/data";

export const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener datos");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
