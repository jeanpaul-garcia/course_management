import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateToken } from "@/app/utils/tokenValidator";

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

  const cursos = (await prisma.curso.findMany({
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
        select: {
            estado: true
        }
      }
    },
    where: {
        inscripciones:{
            some: {
                usuario_id: decoded.userId
            }
        }
    }
  })).map(({ inscripciones, ...course }) => {
    return {
      ...course,
      estado: inscripciones[0]?.estado,
    };
  });
  
  
  return NextResponse.json(cursos);
}
