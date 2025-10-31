import * as fs from 'fs';
import * as path from 'path';

// Try to load from .env.local file
function loadEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.warn('.env.local file not found, using environment variables');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

const envVars = loadEnvFile();

export const config = {
  supabaseUrl: envVars.SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: envVars.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  powersyncUrl: envVars.POWERSYNC_URL || process.env.POWERSYNC_URL || 'http://localhost:8080',
};

// Validate configuration
if (!config.supabaseAnonKey) {
  console.error('Warning: SUPABASE_ANON_KEY not set. Please configure .env.local');
}

