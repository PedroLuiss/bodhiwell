/**
 * Respuesta para la solicitud de recuperación (Forgot Password)
 */
export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Respuesta de validación de token
 */
export interface ValidateTokenResponse {
  valid: boolean;
}

/**
 * Respuesta tras restablecer la contraseña exitosamente
 */
export interface ResetPasswordResponse {
  message: string;
}

