import { Prisma } from "@prisma/client";

/**
 * True when Prisma cannot reach the database (host down, wrong URL, firewall,
 * Railway service stopped / sleeping, TCP proxy changed, etc.).
 */
export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === "P1001" || // Can't reach database server
      error.code === "P1002" || // Connection timeout
      error.code === "P1017" // Server closed the connection
    );
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}
