import { validateRole } from "@/app/utils/roleValidator";
import { validateToken } from "@/app/utils/tokenValidator";
import prisma from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
      const category = await prisma.categoria.findUnique({
        where: {
            id: Number(params.id)
        }
      });
      return NextResponse.json(category);
    } catch (error) {
      return NextResponse.json(
        { message: "Error al obtener las categorias" },
        { status: 500 }
      );
    }
  }

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
  
    // Obtener los datos enviados en la solicitud
    const { nombre, descripcion } = await request.json();
  
    // Validación de datos
    if (!nombre || !descripcion) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }
  
    try {
      // Actualizar la categoría en la base de datos
      const updatedCategory = await prisma.categoria.update({
        where: {
          id: Number(params.id), 
        },
        data: {
          nombre,
          descripcion,
        },
      });
  
      return NextResponse.json({ categoria: updatedCategory });
    } catch (error) {
      return NextResponse.json(
        { message: "Error al actualizar la categoría" },
        { status: 500 }
      );
    }
  }