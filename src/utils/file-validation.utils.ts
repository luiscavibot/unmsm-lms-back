export function isValidResumeMimeType(mimeType: string): boolean {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ];
  
  return allowedMimeTypes.includes(mimeType);
}

export function getResumeValidMimeTypesDescription(): string {
  return 'PDF o imagen (JPEG, PNG, GIF, WEBP, BMP, TIFF)';
}

export const RESUME_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png', 
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
];
