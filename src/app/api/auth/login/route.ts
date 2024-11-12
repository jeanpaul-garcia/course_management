import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from "@/lib/prisma";
import { verifyPassword } from '@/app/utils/encriptionUtil';

// Función para iniciar sesión de usuario
export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email y contraseña son requeridos' }, { status: 400 });
  }

  // Buscar el usuario en la base de datos
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { rol: true },
  });


  if (!user) {
    return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
  }

  // Validar la contraseña
  const isPasswordValid = await verifyPassword(password, user.password);
  
  if (!isPasswordValid) {
    return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
  }

  // Generar el token JWT
  const jwtSecret = process.env.JWT_SECRET || 'default@secret';

  const token = jwt.sign(
    { userId: user.id, rolId: user.rol_id },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );

  return NextResponse.json({ token, usuario: { id: user.id, nombres: user.nombres, apellidos: user.apellidos, email: user.email, rol: user.rol } });
}
