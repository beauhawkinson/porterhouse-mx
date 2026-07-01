// Shared between the client form and the server upload handler. Kept free of
// server-only imports so it's safe to pull into client components.

export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
export const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";
