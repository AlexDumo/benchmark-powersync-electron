import {
  createBaseLogger,
  LogLevel,
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";
import { BenchmarkSchema } from "sql-gen";
import { connector } from "./SupabaseConnector";

const logger = createBaseLogger();
logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);

/**
 * PowerSync database configuration for benchmarking
 * Uses OPFSCoopSyncVFS for best performance and compatibility
 */
export const powerSync = new PowerSyncDatabase({
  database: new WASQLiteOpenFactory({
    dbFilename: "benchmark.db",
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
    flags: {
      enableMultiTabs: typeof SharedWorker !== "undefined",
    },
  }),
  flags: {
    enableMultiTabs: typeof SharedWorker !== "undefined",
  },
  schema: BenchmarkSchema,
  logger: logger,
});

// Sign in the user anonymously to Supabase (creates a temporary user session)
await connector.signInAnonymously();

// Establish connection between PowerSync and the Supabase connector
powerSync.connect(connector);

