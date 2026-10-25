import axiosInstance from './axiosInstance';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  Auth
} from "firebase/auth";
import { app } from "./firebaseConfig";
import { ForgotPasswordResponse, ResetPasswordResponse, ValidateTokenResponse } from '../types/auth/auth.type';

let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

if (app) {
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
}

// Interfaces
interface Credentials {
  email: string;
  password: string;
}

interface User {
  [key: string]: any;
  type_account?: string;
}

interface AuthResponse {
  token?: string;
  refresh_token?: string;
  user?: User;
  message?: string;
}

interface AuthError {
  code?: number | string;
  message?: string;
  error?: string;
}

interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  type_account: string;
  main_profession_uid?: string;
  newsletter_active?: boolean;
  details?: {
    main_profession_uid?: string
  }
}

export interface LoginFirebaseResponse {
  error?: boolean;
  message?: string;
  token?: string;
  refresh_token?: string;
  user?: User;
}

export interface LoginFirebaseError {
  error: boolean;
  message: string;
}

export type GoogleLoginResult = 
  | { error: false; user: any; accessToken: string }
  | { error: true; message: string };

/**
 * Servicio de autenticación para login con JWT
 * @param {Object} credentials { email, password }
 * @returns {Promise<{ token: string, user: json }>} Respuesta con el token o error
 */
export const login = async (
  credentials: Credentials
): Promise<AuthResponse | AuthError> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/jwt-login', credentials);

    if ((response.status === 200 || response.status === 201) && response.data.token) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      } else {
        localStorage.removeItem('token');
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        localStorage.removeItem('user');
      }

      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      } else {
        localStorage.removeItem('refresh_token');
      }

      return {
        token: response.data.token,
        user: response.data.user
      };
    }

    throw new Error('Respuesta inesperada del servidor');
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return { error: 'Credenciales incorrectas' };
    }

    return { error: error.message || 'Error de red' };
  }
};

/**
 * Servicio de autenticación para registro
 * @param {Object} formData { first_name, last_name, email, password }
 * @returns {Promise<{ token: string, user: json }>} Respuesta con el token o error
 */

export const register = async (
  formData: RegisterFormData
): Promise<AuthResponse | AuthError> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/register', formData);



    if (response.status === 200 || response.status === 201) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      return response.data;
    }

    throw new Error('Respuesta inesperada del servidor');
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return { error: 'Credenciales incorrectas' };
    }
    if (error.response && error.response.status === 400) {
      return error.response.data;
    }

    return { error: error.message || 'Error de red' };
  }
};

/**
 * Initiates the Google sign-in process using a popup window.
 *
 * Attempts to authenticate the user with Google via Firebase Authentication.
 * Returns an object containing the authenticated user on success, or an error message on failure.
 *
 * @returns A promise that resolves to a `GoogleLoginResult`.
 */
export const loginWithGoogle = async (): Promise<GoogleLoginResult> => {
  if (!auth || !provider) {
    return { error: true, message: "Google Login no disponible (Falta configuración de Firebase)" };
  }
  try {
    const result = await signInWithPopup(auth, provider);
    const accessToken = await result.user.getIdToken();

    if (!result.user) {
      throw new Error('No se pudo obtener el usuario de Google');
    }

    return {
      error: false,
      user: result.user,
      accessToken: accessToken
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error en Google Login:", error.message);
      return { error: true, message: error.message };
    } else {
      console.error("Error en Google Login:", error);
      return { error: true, message: String(error) };
    }
  }
};

/**
 * Initiates the Google sign-in process using a redirect.
 * More reliable for mobile browsers like Safari.
 */
export const loginWithGoogleRedirect = async () => {
  if (!auth || !provider) return;
  await signInWithRedirect(auth, provider);
};

/**
 * Handles the result of a Google sign-in redirect.
 */
export const getGoogleRedirectResult = async (): Promise<GoogleLoginResult | null> => {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const accessToken = await result.user.getIdToken();
      return {
        error: false,
        user: result.user,
        accessToken: accessToken
      };
    }
  } catch (error: any) {
    console.error("Error en Google Redirect Result:", error);
    return { error: true, message: error.message };
  }
  return null;
};

/**
 * Authenticates a user with Firebase using the provided access token.
 *
 * Sends a POST request to the `/api/auth/firebase-login` endpoint with the given access token.
 * If authentication is successful and a token is returned, it stores the token in localStorage.
 * Returns an object indicating success or failure, along with a message and the token if successful.
 *
 * @param accessToken - The Firebase access token to authenticate the user.
 * @returns A promise that resolves to a `LoginFirebaseResponse` on success or a `LoginFirebaseError` on failure.
 */
export const loginWithFirebase = async (
  accessToken: string
): Promise<LoginFirebaseResponse | LoginFirebaseError> => {
  try {
    const response = await axiosInstance.post<LoginFirebaseResponse>(
      '/api/auth/firebase-login',
      { accessToken }
    );

    if (
      (response.status === 200 || response.status === 201)
      && response.data.token
      && response.data.user
    ) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      return {
        error: false,
        message: 'Login exitoso',
        token: response.data.token,
        user: response.data.user,
      };
    }

    throw new Error('Respuesta inesperada del servidor');
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      return { error: true, message: error.response.data.message };
    }

    return { error: true, message: error.message || 'Error de red' };
  }
};


export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await axiosInstance.post<ForgotPasswordResponse>('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    // Retornamos el error estructurado para que el hook lo maneje
    throw error.response?.data || { message: 'Error al procesar la solicitud' };
  }
};


export const validateResetToken = async (token: string): Promise<ValidateTokenResponse> => {
  try {
    const response = await axiosInstance.get<ValidateTokenResponse>(`/api/auth/validate-token/${token}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Token inválido o expirado' };
  }
};


export const resetPassword = async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
  try {
    const response = await axiosInstance.post<ResetPasswordResponse>('/api/auth/reset-password', { token, newPassword });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Error al restablecer la contraseña' };
  }
};

export const verifyOtp = async (email: string, code: string) => {
  const response = await axiosInstance.post(`/api/auth/verify-email`, { email, code });
  return response.data;
};

export const resendVerifyEmail = async (email: string) => {
  const response = await axiosInstance.post(`/api/auth/resend-verification`, { email });
  return response.data;
};

/**
 * Refresca el token de acceso utilizando el refresh_token
 * @returns {Promise<{ token: string, refresh_token: string }>} Nuevos tokens
 */
export const refreshTokenService = async (): Promise<AuthResponse> => {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) {
    throw new Error('No hay refresh token disponible');
  }

  const response = await axiosInstance.post<AuthResponse>('/api/auth/token/refresh', {
    refresh_token
  });

  if (response.status === 200 && response.data.token) {
    localStorage.setItem('token', response.data.token);
    if (response.data.refresh_token) {
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  }

  throw new Error('No se pudo refrescar el token');
};

