import axios, { AxiosInstance, AxiosError } from 'axios';
import type { HomeAssistantConfig } from '../config/env';

export interface SensorState {
  id: string;
  state: string;
  lastChanged: string;
  lastUpdated: string;
  attributes: Record<string, unknown>;
  friendlyName?: string;
}

export class HomeAssistantRequestError extends Error {
  public readonly status: number | undefined;
  public readonly sensorId: string;

  constructor(sensorId: string, message: string, error?: AxiosError) {
    super(message);
    this.sensorId = sensorId;
    this.status = error?.response?.status;
  }
}

export class HomeAssistantClient {
  private readonly http: AxiosInstance;

  constructor(private readonly config: HomeAssistantConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs,
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
  }

  async fetchSensorState(sensorId: string): Promise<SensorState> {
    try {
      const { data } = await this.http.get(`/api/states/${sensorId}`);
      return this.mapSensorState(data);
    } catch (error) {
      const axiosError = error as AxiosError;
      const reason = axiosError.response?.statusText ?? axiosError.message;
      throw new HomeAssistantRequestError(sensorId, `Failed to fetch sensor: ${reason}`, axiosError);
    }
  }

  async fetchMany(sensorIds: string[]): Promise<SensorState[]> {
    return Promise.all(sensorIds.map((sensorId) => this.fetchSensorState(sensorId)));
  }

  private mapSensorState(payload: any): SensorState {
    return {
      id: payload?.entity_id ?? 'unknown',
      state: payload?.state ?? 'unknown',
      lastChanged: payload?.last_changed ?? '',
      lastUpdated: payload?.last_updated ?? '',
      attributes: payload?.attributes ?? {},
      friendlyName: payload?.attributes?.friendly_name,
    };
  }
}
