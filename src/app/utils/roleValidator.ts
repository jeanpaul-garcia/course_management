import prisma from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function validateRole(rolId: number, role: RoleType) {
  const defaultRole = await prisma.role.findUnique({
    where: {
      id: rolId,
    },
  });

  if (!defaultRole || defaultRole.nombre != role) {
    return {
      unauthorized: true,
    };
  }

  return {
    unauthorized: false,
    role: defaultRole,
  };
}
