import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateToken } from "@/app/utils/tokenValidator";
import { validateRole } from "@/app/utils/roleValidator";
import { RoleType } from "@prisma/client";

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

  const cursos = (
    await prisma.curso.findMany({
      include: {
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
        inscripciones: {
          where: { usuario_id: decoded.userId },
          select: { usuario_id: true },
        },
      },
    })
  ).map(({ inscripciones, ...course }) => {
    return {
      ...course,
      inscrito: inscripciones.length > 0,
    };
  });

  return NextResponse.json(cursos);
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
    const body = await request.json();
    const { titulo, descripcion, fecha_finalizacion, categorias, recursos } =
      body;

    // Validar los datos del curso
    if (
      !titulo ||
      !descripcion ||
      !fecha_finalizacion ||
      !categorias ||
      !recursos
    ) {
      return NextResponse.json(
        { message: "Faltan datos necesarios para crear el curso" },
        { status: 400 }
      );
    }

    // Crear el nuevo curso
    const newCourse = await prisma.curso.create({
      data: {
        titulo,
        descripcion,
        fecha_creacion: new Date(),
        fecha_finalizacion: new Date(fecha_finalizacion),
        creador_id: decoded.userId, // El creador será el usuario autenticado
        categorias: {
          create: categorias.map((categoria: { id: number }) => ({
            categoria_id: categoria.id,
          })),
        },
        recursos: {
            create: recursos.map((recurso: { tipo: string; url: string }) => ({
              tipo: recurso.tipo, 
              url: recurso.url,  
            })),
          },
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear el curso" },
      { status: 500 }
    );
  }
}
