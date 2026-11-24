const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapes text placed into the printable receipt's HTML string. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ENTITIES[char]);
}
