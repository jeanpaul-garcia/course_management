import { validateToken } from "@/app/utils/tokenValidator";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

  try {
    const cursoId =  Number(params.id)
    // Verificar que el curso exista
    const curso = await prisma.curso.findUnique({
      where: {
        id: cursoId,
      },
    });

    if (!curso) {
      return NextResponse.json(
        { message: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario no esté ya inscrito
    const existingInscription = await prisma.inscripcion.findFirst({
      where: {
        usuario_id: decoded.userId,
        curso_id: cursoId,
      },
    });

    if (existingInscription) {
      return NextResponse.json(
        { message: "Ya estás inscrito en este curso" },
        { status: 400 }
      );
    }

    // Crear la inscripción
    const newInscription = await prisma.inscripcion.create({
      data: {
        usuario_id: decoded.userId,
        curso_id: cursoId,
        fecha_inscripcion: new Date(),
        estado: "ACTIVE",
      },
    });

    return NextResponse.json(
      { message: "Inscripción realizada exitosamente", inscription: newInscription },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error al procesar la inscripción" },
      { status: 500 }
    );
  }
}

