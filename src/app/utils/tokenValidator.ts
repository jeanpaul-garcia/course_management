import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'default@secret';

/**
 * Valida un token JWT y devuelve la información decodificada si es válido.
 * @param token - El token JWT que se va a validar.
 * @returns El payload del token decodificado si es válido, o un error si no lo es.
 */
export function validateToken(token: string) {
  try {
    // Verificar el token
    const decoded = jwt.verify(token, jwtSecret);
    return { isValid: true, decoded: decoded as any };
  } catch (error) {
    return { isValid: false, message: 'Token inválido o expirado' };
  }
}
