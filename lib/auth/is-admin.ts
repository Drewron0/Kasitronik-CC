/** Admin is set by hand in Supabase as app_metadata.role = "admin"; users cannot edit app_metadata. */
export function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return user?.app_metadata?.role === "admin";
}
