export function translateAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar na plataforma.";
  }

  if (normalized.includes("user already registered")) {
    return "Este e-mail já está cadastrado.";
  }

  if (
    normalized.includes("password") &&
    normalized.includes("at least")
  ) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (normalized.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  if (normalized.includes("signup requires a valid password")) {
    return "Informe uma senha válida com pelo menos 8 caracteres.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}
