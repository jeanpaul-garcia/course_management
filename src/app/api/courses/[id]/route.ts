import { validateRole } from "@/app/utils/roleValidator";
import { validateToken } from "@/app/utils/tokenValidator";
import prisma from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";

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

  try {
    const course = await prisma.curso.findUnique({
      where: {
        id: Number(params.id),
        OR: [
          { creador_id: decoded.userId },
          {
            inscripciones: {
              some: {
                usuario_id: decoded.userId,
              },
            },
          },
        ],
      },
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
            estado: true,
          },
          where: {
            usuario_id: decoded.userId,
          },
        },
        categorias: {
          select: {
            categoria: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
              },
            },
          },
        },
        recursos: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const { inscripciones, ...restoCurso } = course;

    let formatted = {
      ...restoCurso,
      categorias: course?.categorias.map((cat) => cat.categoria),
      inscrito: inscripciones.length > 0,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener curso" },
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
    const body = await request.json();
    const { titulo, descripcion, fecha_finalizacion, categorias, recursos } =
      body;

    // Validar los datos
    if (
      !titulo ||
      !descripcion ||
      !fecha_finalizacion ||
      !categorias ||
      !recursos
    ) {
      return NextResponse.json(
        { message: "Faltan datos necesarios para editar el curso" },
        { status: 400 }
      );
    }

    // Verificar que el curso existe y que el usuario sea el creador
    const course = await prisma.curso.findUnique({
      where: { id: Number(params.id) },
      include: { creador: true },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Curso no encontrado" },
        { status: 404 }
      );
    }

    if (course.creador.id !== decoded.userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Actualizar el curso
    const updatedCourse = await prisma.curso.update({
      where: { id: Number(params.id) },
      data: {
        titulo,
        descripcion,
        fecha_finalizacion: new Date(fecha_finalizacion),
        categorias: {
          deleteMany: {}, // Elimina las categorías existentes
          create: categorias.map((categoria: { id: number }) => ({
            categoria_id: categoria.id, // Crea nuevas categorías
          })),
        },
        recursos: {
          deleteMany: {}, // Elimina los recursos actuales
          create: recursos.map((recurso: { tipo: string; url: string }) => ({
            tipo: recurso.tipo,
            url: recurso.url,
          })),
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Error al editar el curso" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

  const cursoId = Number(params.id);

  try {
    const { estado } = await request.json();

    // Verificar que la inscripción exista
    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        usuario_id: decoded.userId,
        curso_id: cursoId,
      },
    });

    if (!inscripcion) {
      return NextResponse.json(
        { message: "No estás inscrito en este curso" },
        { status: 404 }
      );
    }

    // Actualizar el estado de la inscripción
    const updatedInscription = await prisma.inscripcion.update({
      where: {
        id: inscripcion.id,
      },
      data: {
        estado, // Cambiar el estado de la inscripción
      },
    });

    return NextResponse.json(
      {
        message: "Estado de la inscripción actualizado",
        inscription: updatedInscription,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error al actualizar el estado de la inscripción" },
      { status: 500 }
    );
  }
}
