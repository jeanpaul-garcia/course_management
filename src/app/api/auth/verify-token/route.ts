import { validateToken } from '@/app/utils/tokenValidator';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Obtener el token desde los headers
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
  }

  // Usar la función del util para validar el token
  const { isValid, decoded, message } = validateToken(token);

  if (isValid) {
    return NextResponse.json({ isValid, decoded });
  } 

  return NextResponse.json({ isValid, message }, { status: 401 });
}
