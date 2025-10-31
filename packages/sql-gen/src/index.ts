// Export standard SQLite tests by default
export * from './generate-tests.js';

// Export PowerSync schema
export * from './powersync-schema.js';

// Export PowerSync tests as a namespace to avoid naming conflicts
import * as PowerSyncTests from './generate-powersync-tests.js';
export { PowerSyncTests };
