import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export async function getSettings() {
  const isServerless = process.env.USING_SERVERLESS === 'true' || process.env.NEXT_RUNTIME === 'edge';
  if (isServerless) {
    try {
      return (await import('../data/settings.json')).default;
    } catch {
      return {};
    }
  }
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    try {
      return (await import('../data/settings.json')).default;
    } catch {
      return {};
    }
  }
}

export async function setSettings(next) {
  const isServerless = process.env.USING_SERVERLESS === 'true' || process.env.NEXT_RUNTIME === 'edge';
  if (isServerless) {
    throw new Error('Settings cannot be persisted on a serverless filesystem. Use a database/KV store, or deploy somewhere with persistent disk.');
  }
  const json = JSON.stringify(next, null, 2);
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, json, 'utf-8');
  return next;
}


