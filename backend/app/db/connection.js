import dotenv from "dotenv";
dotenv.config(); // must be first line
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Helper function to execute existing strict SQL queries via Prisma
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    // Extract Prisma raw query execution. 
    // pg uses $1, $2, etc. Prisma $queryRawUnsafe supports this on Postgres.
    const rows = await prisma.$queryRawUnsafe(text, ...params);
    const duration = Date.now() - start;
    
    // Some Prisma queries might return count for updates instead of rows,
    // handle varying return types from $queryRawUnsafe
    let rowCount = 0;
    let resultRows = [];
    
    if (Array.isArray(rows)) {
      resultRows = rows;
      rowCount = rows.length;
    } else if (typeof rows === 'number') {
      rowCount = rows;
    }

    console.log("Executed query via Prisma", { duration, rowCount });
    
    // Return pg-compatible result object
    return { rows: resultRows, rowCount };
  } catch (error) {
    console.error("Query error", { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool for transactions
// Mocked for backward compatibility if transaction client was used
export const getClient = async () => {
  return {
    query: (...args) => query(...args),
    release: () => {},
  };
};

export default prisma;
