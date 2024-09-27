// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const nonce = crypto.randomUUID(); // Generar el nonce
  const response = NextResponse.next();

  // Configurar CSP para permitir estilos y scripts en línea con el nonce
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}';`
  );
  response.headers.set('x-nonce', nonce); // Enviar el nonce al servidor Next.js

  return response;
}
