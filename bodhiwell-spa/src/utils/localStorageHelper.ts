
export const REDIRECT_AFTER_LOGIN = 'redirectAfterLogin';
export const REMEMBER_ME_EMAIL = 'rememberMeEmail';


const isBrowser = typeof window !== 'undefined';

const setItem = <T>(key: string, value: T): void => {
  if (!isBrowser) {
    console.warn(`localStorage no está disponible. No se guardó la clave: "${key}"`);
    return;
  }

  try {
    const serializedValue = JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error al guardar en localStorage para la clave "${key}":`, error);
  }
};


const getItem = <T>(key: string): T | null => {
  if (!isBrowser) {
    return null;
  }

  try {
    const serializedValue = window.localStorage.getItem(key);
    if (serializedValue === null) {
      return null;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`Error al obtener de localStorage para la clave "${key}":`, error);
    removeItem(key);
    return null;
  }
};


const removeItem = (key: string): void => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error al eliminar de localStorage para la clave "${key}":`, error);
  }
};


const clear = (): void => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.clear();
  } catch (error) {
    console.error("Error al limpiar localStorage:", error);
  }
};

export const localStorageHelper = {
  setItem,
  getItem,
  removeItem,
  clear,
};