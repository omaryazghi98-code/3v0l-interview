import { existsSync, readFileSync } from 'node:fs';

// Load the local copilot environment before server.mjs is imported so all
// provider constants are populated at module initialization time.
const envPath = new URL('./.env', import.meta.url);
if (existsSync(envPath)) {
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

// The Python audio bridge owns 38472/38473. Node owns only the copilot relay
// on 38471 unless an operator explicitly overrides AUDIO_ENABLED=1.
if (process.env.AUDIO_ENABLED === undefined) process.env.AUDIO_ENABLED = '0';

await import('./server.mjs');
