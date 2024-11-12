import { validateRole } from "@/app/utils/roleValidator";
import { validateToken } from "@/app/utils/tokenValidator";
import prisma from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";

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
    const roles = await prisma.role.findMany();
    return NextResponse.json({ roles });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los roles" },
      { status: 500 }
    );
  }
}
