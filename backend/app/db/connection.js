import dotenv from "dotenv";
dotenv.config(); // must be first line
import pg from "pg";

const { Pool } = pg;

// Supabase connection configuration
// If DATABASE_URL is provided (Supabase connection string), use it directly
// Otherwise, use individual connection parameters
const getPoolConfig = () => {
  // Check if DATABASE_URL is provided (Supabase connection string)
  if (process.env.DB_URL) {
    return {
      connectionString: process.env.DB_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false } // For Supabase production
          : { rejectUnauthorized: false }, // For Supabase development
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000, // Increased for cloud connections
    };
  }

  // Fallback to individual connection parameters (for local development)
  return {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "packvision",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "sidak",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

// Create a connection pool
const pool = new Pool(getPoolConfig());

// Test the connection
pool.on("connect", () => {
  const dbType = process.env.DATABASE_URL ? "Supabase" : "PostgreSQL";
  console.log(`✅ Connected to ${dbType} database`);
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("\n❌ Database Connection Error:");
      if (process.env.DATABASE_URL) {
        console.error("Unable to connect to Supabase database.");
        console.error("Please check your DATABASE_URL in the .env file.");
        console.error(
          "Get your connection string from: Supabase Dashboard → Settings → Database → Connection string"
        );
      } else {
        console.error("PostgreSQL is not running or not accessible.");
        console.error(
          `\nTrying to connect to: ${process.env.DB_HOST || "localhost"}:${
            process.env.DB_PORT || 5432
          }`
        );
        console.error(
          "\n💡 To set up PostgreSQL, see: backend/SETUP_DATABASE.md"
        );
        console.error("\nQuick start options:");
        console.error(
          "1. Using Docker: cd infra && docker compose up -d postgres"
        );
        console.error("2. Install PostgreSQL locally (see setup guide)");
        console.error(
          "3. Use Supabase (cloud PostgreSQL): https://supabase.com"
        );
      }
      console.error(
        "\nAfter database is configured, run migrations: npm run migrate\n"
      );
    }
    console.error("Query error", { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool for transactions
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
    console.error(
      `The last executed query on this client was: ${client.lastQuery}`
    );
  }, 5000);

  // Monkey patch the query method to log the last query
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
};

export default pool;
