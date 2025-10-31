import { PowerSyncDatabase } from "@powersync/node";
import { BenchmarkSchema } from "sql-gen";
import { SupabaseConnector } from "./SupabaseConnector.js";

export async function createPowerSyncDatabase() {
  const connector = new SupabaseConnector();

  const db = new PowerSyncDatabase({
    schema: BenchmarkSchema,
    database: {
      dbFilename: "benchmark-node.db",
    },
  });

  // Sign in anonymously
  await connector.signInAnonymously();

  // Connect to PowerSync
  await db.connect(connector);

  console.log('PowerSync connected');
  console.log('SDK Version:', db.sdkVersion);

  return db;
}

