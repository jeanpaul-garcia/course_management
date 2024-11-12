import { NextResponse } from "next/server";
import { PrismaClient, RoleType } from "@prisma/client";
import { validateToken } from "@/app/utils/tokenValidator";
import { validateRole } from "@/app/utils/roleValidator";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(params.id) },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        rol: { select: { id: true, nombre: true } },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ usuario });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { nombres, apellidos, email, rol } = await request.json();

    const currentUser = await prisma.usuario.findUnique({
      where: { id: Number(params.id) },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (currentUser.email != email) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "El email ya está en uso" },
          { status: 400 }
        );
      }
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

    // Actualizar usuario
    const updatedUsuario = await prisma.usuario.update({
      where: { id: Number(params.id) },
      data: { nombres, apellidos, email, rol_id: role.id },
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
    return NextResponse.json(
      { message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ message: "Token requerido" });
  }
}
