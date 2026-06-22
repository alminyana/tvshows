/** Parses a base64 dataURL into its components. Returns null if the format is invalid. */
export function parseDataUrl(dataUrl: string): { base64: string; mime: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

/** Converts a base64 dataURL to Uint8Array + mime type. Returns null if the format is invalid. */
export function dataUrlToUint8Array(dataUrl: string): { data: Uint8Array; mime: string } | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  const binary = atob(parsed.base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { data: bytes, mime: parsed.mime };
}

/** Returns a file extension for a given mime type. Defaults to 'bin'. */
export function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] ?? 'bin';
}
