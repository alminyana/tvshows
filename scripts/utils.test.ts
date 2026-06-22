import { describe, it, expect } from 'vitest';
import { parseDataUrl, dataUrlToUint8Array, mimeToExt } from './utils';

describe('parseDataUrl', () => {
  it('parsea un dataURL válido', () => {
    const result = parseDataUrl('data:image/png;base64,abc123');
    expect(result).toEqual({ mime: 'image/png', base64: 'abc123' });
  });

  it('devuelve null para una cadena que no es dataURL', () => {
    expect(parseDataUrl('not-a-data-url')).toBeNull();
    expect(parseDataUrl('')).toBeNull();
  });

  it('devuelve null si falta el prefijo base64', () => {
    expect(parseDataUrl('data:image/png,abc123')).toBeNull();
  });
});

describe('dataUrlToUint8Array', () => {
  it('convierte un dataURL a Uint8Array correctamente', () => {
    // "ABC" en base64 es "QUJD"
    const result = dataUrlToUint8Array('data:image/png;base64,QUJD');
    expect(result).not.toBeNull();
    expect(result!.mime).toBe('image/png');
    expect(result!.data).toBeInstanceOf(Uint8Array);
    expect(Array.from(result!.data)).toEqual([65, 66, 67]); // A B C
  });

  it('devuelve null para entrada inválida', () => {
    expect(dataUrlToUint8Array('invalid')).toBeNull();
  });
});

describe('mimeToExt', () => {
  it('mapea mime types conocidos', () => {
    expect(mimeToExt('image/png')).toBe('png');
    expect(mimeToExt('image/jpeg')).toBe('jpg');
    expect(mimeToExt('image/webp')).toBe('webp');
  });

  it('devuelve bin para mime types desconocidos', () => {
    expect(mimeToExt('application/octet-stream')).toBe('bin');
  });
});
