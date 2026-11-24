/** Only routes owned by the authenticated workspace can be return destinations. */
export function safeReturnUrl(value: string | null): string {
  if (!value || !/^\/(home|projetos|perfil|projeto\/[^/?#]+)(?:[?#].*)?$/.test(value))
    return '/home';
  if (value.includes('\\') || /[\u0000-\u001f]/.test(value)) return '/home';
  return value;
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function focusInvalidField(form: HTMLFormElement): void {
  // Angular applies the aria state after the submit handler finishes.
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}
