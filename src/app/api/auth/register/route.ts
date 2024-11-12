import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from "@/lib/prisma";
import { hashPassword } from '@/app/utils/encriptionUtil';
import { RoleType } from '@prisma/client';

// Función para registrar un nuevo usuario
export async function POST(request: Request) {
  const { nombres, apellidos, email, password } = await request.json();

  if (!nombres || !apellidos || !email || !password) {
    return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
  }

  // Verificar si el email ya existe
  const existingUser = await prisma.usuario.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: 'El email ya está en uso' }, { status: 400 });
  }

  const defaultRole = await prisma.role.findUnique({
    where: {
        nombre: RoleType.ESTUDIANTE
    }
  })

  if(!defaultRole){
    return NextResponse.json({ message: 'Rol no encontrado' }, { status: 400 });
  }

  // Hashear la contraseña
  const hashedPassword = await hashPassword(password);

  // Crear el usuario en la base de datos
  const newUser = await prisma.usuario.create({
    data: {
      nombres,
      apellidos,
      email,
      password: hashedPassword,
      rol_id: defaultRole?.id,
      fecha_creacion: new Date(),
    },
    include: { rol: true },
  });

  // Generar el token JWT
  const jwtSecret = process.env.JWT_SECRET || 'default@secret';

  const token = jwt.sign({ userId: newUser.id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  });

  return NextResponse.json({ token, user: { id: newUser.id, nombres, apellidos, email, rol: newUser.rol } });
}
