const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos",
  email_not_confirmed:
    "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada",
  user_already_registered: "Ya existe una cuenta con este correo",
  weak_password: "La contraseña es demasiado débil",
  signup_disabled: "El registro no está disponible en este momento",
};

export function mapAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  if (normalized.includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }

  if (normalized.includes("user already registered")) {
    return AUTH_ERROR_MESSAGES.user_already_registered;
  }

  if (normalized.includes("password")) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }

  return "Ocurrió un error. Intenta de nuevo en unos momentos";
}
