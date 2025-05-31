export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

export function isValidFileMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function getValidMimeTypesDescription(): string {
  return 'PDF o imagen (JPEG, PNG, GIF, WEBP, BMP, TIFF)';
}

// Resume specific functions (for backward compatibility)
export function isValidResumeMimeType(mimeType: string): boolean {
  return isValidFileMimeType(mimeType);
}

export function getResumeValidMimeTypesDescription(): string {
  return getValidMimeTypesDescription();
}

export const RESUME_ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;

// Syllabus specific functions
export function isValidSyllabusMimeType(mimeType: string): boolean {
  return isValidFileMimeType(mimeType);
}

export function getSyllabusValidMimeTypesDescription(): string {
  return getValidMimeTypesDescription();
}

export const SYLLABUS_ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
