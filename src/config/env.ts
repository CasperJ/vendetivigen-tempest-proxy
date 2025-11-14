import dotenv from 'dotenv';

dotenv.config();

export interface HomeAssistantConfig {
  baseUrl: string;
  token: string;
  sensors: string[];
  timeoutMs: number;
}

export interface AppConfig {
  port: number;
  homeAssistant: HomeAssistantConfig;
}

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toSensors = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((sensor) => sensor.trim())
    .filter((sensor) => sensor.length > 0);
};

const normalizeBaseUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);
  return url.toString().replace(/\/$/, '');
};

const sensors = toSensors(process.env.HA_SENSORS);

if (sensors.length === 0) {
  throw new Error('Provide at least one sensor id via HA_SENSORS environment variable');
}

export const config: AppConfig = {
  port: toNumber(process.env.PORT, 8080),
  homeAssistant: {
    baseUrl: normalizeBaseUrl(requireEnv('HA_BASE_URL')),
    token: requireEnv('HA_TOKEN'),
    sensors,
    timeoutMs: toNumber(process.env.HA_TIMEOUT_MS, 5000),
  },
};
