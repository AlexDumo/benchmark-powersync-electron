import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  UpdateType,
  type PowerSyncBackendConnector,
} from "@powersync/node";

import {
  SupabaseClient,
  createClient,
  type PostgrestSingleResponse,
  type Session,
} from "@supabase/supabase-js";

import { config } from "../config.js";

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE
  new RegExp("^42501$"),
];

export type SupabaseConnectorListener = {
  initialized: () => void;
  sessionStarted: (session: Session) => void;
};

export class SupabaseConnector
  extends BaseObserver<SupabaseConnectorListener>
  implements PowerSyncBackendConnector {
  readonly client: SupabaseClient;
  currentSession: Session | null;

  constructor() {
    super();

    this.client = createClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
        },
      }
    );
    this.currentSession = null;
  }

  async signInAnonymously() {
    const { data: { user } } = await this.client.auth.getUser();
    if (user?.id) {
      console.log('Already signed in as:', user.id);
      return;
    }

    const {
      data: { session },
      error
    } = await this.client.auth.signInAnonymously();

    if (error) {
      throw error;
    }

    console.log('Signed in anonymously');
    this.updateSession(session);
  }

  updateSession(session: Session | null) {
    this.currentSession = session;
    if (!session) {
      return;
    }
    this.iterateListeners((cb) => cb.sessionStarted?.(session));
  }

  async fetchCredentials() {
    const {
      data: { session },
      error
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    return {
      endpoint: config.powersyncUrl,
      token: session.access_token,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    try {
      for (const op of transaction.crud) {
        lastOp = op;
        const table = this.client.from(op.table);
        let result: PostgrestSingleResponse<null>;

        switch (op.op) {
          case UpdateType.PUT:
            result = await table.upsert({ ...op.opData, id: op.id });
            break;
          case UpdateType.PATCH:
            result = await table.update(op.opData).eq("id", op.id);
            break;
          case UpdateType.DELETE:
            result = await table.delete().eq("id", op.id);
            break;
        }

        if (result.error) {
          console.error(result.error);
          throw result.error;
        }
      }

      await transaction.complete();
    } catch (ex: unknown) {
      const error = ex as { code?: string };
      if (
        typeof error.code === "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(error.code!))
      ) {
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        throw ex;
      }
    }
  }
}

