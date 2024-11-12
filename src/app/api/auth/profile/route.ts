import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '@/app/utils/tokenValidator';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
  }

  // Validar el token
  const { isValid, decoded } = validateToken(token);
  if (!isValid) {
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          email: true,
          rol: { select: { id: true, nombre: true } },
        },
      });

    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ usuario });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener el perfil' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
  }

  // Validar el token
  const { isValid, decoded } = validateToken(token);
  if (!isValid) {
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }

  try {
    const { nombres, apellidos } = await request.json();
    
    // Validar que se reciban los datos requeridos
    if (!nombres || !apellidos) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
    }

    // Actualizar el perfil del usuario
    const updatedUsuario = await prisma.usuario.update({
      where: { id: decoded.userId },
      data: { nombres, apellidos },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        rol: { select: { id: true, nombre: true } },
      },
    });

    return NextResponse.json({ usuario: updatedUsuario });
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar el perfil' }, { status: 500 });
  }
}
