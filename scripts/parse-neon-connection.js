#!/usr/bin/env node

/**
 * Parse Neon PostgreSQL connection string into individual components
 * Usage: node scripts/parse-neon-connection.js "postgresql://user:pass@host/db?sslmode=require"
 */

const connectionString = process.argv[2];

if (!connectionString) {
  console.log("\n❌ Error: No connection string provided\n");
  console.log(
    'Usage: node scripts/parse-neon-connection.js "postgresql://user:pass@host/db?sslmode=require"'
  );
  console.log("\nExample:");
  console.log(
    '  node scripts/parse-neon-connection.js "postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"\n'
  );
  process.exit(1);
}

try {
  // Parse PostgreSQL connection string
  const url = new URL(connectionString.replace(/^postgresql:/, "https:"));

  const host = url.hostname;
  const port = url.port || "5432";
  const database = url.pathname.replace(/^\//, "");
  const username = url.username;
  const password = url.password;

  console.log("\n📊 Neon Database Connection Details\n");
  console.log("=".repeat(60));

  console.log("\n🔗 Connection String:");
  console.log(connectionString);

  console.log(
    "\n📝 Individual Components (for Railway environment variables):\n"
  );
  console.log(`DB_CLIENT=pg`);
  console.log(`DB_HOST=${host}`);
  console.log(`DB_PORT=${port}`);
  console.log(`DB_DATABASE=${database}`);
  console.log(`DB_USER=${username}`);
  console.log(`DB_PASSWORD=${password}`);
  console.log(`DB_SSL=true`);

  console.log("\n✨ OR use connection string directly:");
  console.log(`DATABASE_URL=${connectionString}`);

  console.log("\n" + "=".repeat(60));
  console.log(
    "\n✅ Copy these to your Railway Directus service environment variables\n"
  );
} catch (error) {
  console.error("\n❌ Error parsing connection string:", error.message);
  console.log("\nPlease ensure your connection string is in the format:");
  console.log(
    "postgresql://username:password@host.neon.tech/database?sslmode=require\n"
  );
  process.exit(1);
}
