import prisma from '@/lib/prisma';

export async function getCourseById(id: string) {
    const course = await prisma.curso.findFirst({
        where: { id: parseInt(id) },
    });

    if (!course) {
        return null;
    }
    
    return course;
}