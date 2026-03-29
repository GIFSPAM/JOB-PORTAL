/**
 * User-facing message from a thrown value (API wrappers use `Error`, hooks may catch unknown).
 */
export function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
