import { NextResponse } from "next/server";
import { PrismaClient, RoleType } from "@prisma/client";
import { validateToken } from "@/app/utils/tokenValidator";
import { validateRole } from "@/app/utils/roleValidator";
import { hashPassword } from "@/app/utils/encriptionUtil";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ message: "Token requerido" }, { status: 400 });
  }

  // Validar el token
  const { isValid, decoded } = validateToken(token);
  if (!isValid) {
    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 401 }
    );
  }

  // Verificar si el usuario tiene rol de Admin
  const roleValidation = await validateRole(
    decoded.rolId,
    RoleType.ADMINISTRADOR
  );

  if (roleValidation.unauthorized) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        rol: { select: { id: true, nombre: true } },
      },
    });
    return NextResponse.json({ usuarios });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al listar usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ message: "Token requerido" }, { status: 400 });
  }

  // Validar el token
  const { isValid, decoded } = validateToken(token);
  if (!isValid) {
    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 401 }
    );
  }

  // Verificar si el usuario tiene rol de Admin
  const roleValidation = await validateRole(
    decoded.rolId,
    RoleType.ADMINISTRADOR
  );

  if (roleValidation.unauthorized) {
    return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
  }

  try {
    const { nombres, apellidos, email, password, rol } = await request.json();

    // Validación de datos
    if (!nombres || !apellidos || !email || !password || !rol) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "El email ya está en uso" },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: {
        nombre: rol,
      },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role no encontrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Crear un nuevo usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        email,
        password: hashedPassword,
        rol_id: role.id,
        fecha_creacion: new Date(),
      },
    });

    return NextResponse.json({ usuario: newUser });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
