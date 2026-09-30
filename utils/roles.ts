export type ProviderRole = 'consultant' | 'lab' | 'pharmacy';

/*
 * Normalise the role string stored on the user.
 *
 * Signup sends 'consultant' | 'laboratory' | 'pharmacy', but older
 * code/data may use 'doctor' or 'lab'.
 */
export function getRole(role?: string | null): ProviderRole | null {
  switch (role) {
    case 'consultant':
    case 'doctor':
      return 'consultant';

    case 'lab':
    case 'laboratory':
      return 'lab';

    case 'pharmacy':
      return 'pharmacy';

    default:
      return null;
  }
}
